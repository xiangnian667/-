#!/bin/bash
set -e

# ===== 手动构建 Mecha Clash APK =====

ANDROID_HOME=/workspace/android-sdk
BUILD_TOOLS=$ANDROID_HOME/build-tools/35.0.0
PLATFORM=$ANDROID_HOME/platforms/android-35
ANDROID_JAR=$PLATFORM/android.jar
WORK_DIR=/workspace/apk-build

rm -rf $WORK_DIR
mkdir -p $WORK_DIR/{gen,obj,dex,res,assets}

echo "=== 1. 准备资源文件 ==="
# 复制游戏 Web 构建产物到 assets
mkdir -p $WORK_DIR/assets/public
cp -r /workspace/dist/* $WORK_DIR/assets/public/

# 清理 TRAE 推广插件（防止被注入到 APK 中）
sed -i '/window\.TraeBadgePlugin/,/})();/d' $WORK_DIR/assets/public/index.html 2>/dev/null || true
# 确保 HTML 干净，移除任何残留的 badge 脚本
sed -i '/<script>/,/<\/script>/d' $WORK_DIR/assets/public/index.html 2>/dev/null || true
# 确保有正确的 body 结束标签
if ! grep -q '</body>' $WORK_DIR/assets/public/index.html; then
  echo '</body></html>' >> $WORK_DIR/assets/public/index.html
fi

# 创建 AndroidManifest.xml
cat > $WORK_DIR/AndroidManifest.xml << 'MANIFEST'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.mechaclash.app"
    android:versionCode="1"
    android:versionName="1.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="35" />

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:label="机甲冲突"
        android:icon="@mipmap/ic_launcher"
        android:theme="@android:style/Theme.Black.NoTitleBar.Fullscreen"
        android:hardwareAccelerated="true">

        <activity
            android:name=".MainActivity"
            android:screenOrientation="landscape"
            android:keepScreenOn="true"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
MANIFEST

# 创建简单的启动图标 (1x1 透明像素，满足 Android 要求)
mkdir -p $WORK_DIR/res/mipmap-hdpi
# 使用 aapt2 可以处理的最小图标
# 创建一个最小的 PNG (1x1 蓝色像素)
python3 -c "
import struct, zlib
def create_png():
    sig = b'\\x89PNG\\r\\n\\x1a\\n'
    ihdr_data = struct.pack('>IIBBBBB', 48, 48, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    ihdr = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)

    raw = b''
    for y in range(48):
        raw += b'\\x00'  # filter byte
        for x in range(48):
            raw += b'\\xcc\\x22\\x22'  # RGB red-ish

    compressed = zlib.compress(raw)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    idat = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)

    iend_crc = zlib.crc32(b'IEND')
    iend = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)

    return sig + ihdr + idat + iend

with open('$WORK_DIR/res/mipmap-hdpi/ic_launcher.png', 'wb') as f:
    f.write(create_png())
"

echo "=== 2. 编译资源 (aapt2) ==="
$BUILD_TOOLS/aapt2 compile \
    --dir $WORK_DIR/res \
    -o $WORK_DIR/obj/resources.zip

$BUILD_TOOLS/aapt2 link \
    $WORK_DIR/obj/resources.zip \
    -I $ANDROID_JAR \
    --manifest $WORK_DIR/AndroidManifest.xml \
    --java $WORK_DIR/gen \
    -o $WORK_DIR/obj/base.apk \
    --auto-add-overlay

echo "=== 3. 编译 Java 源码 ==="
# 创建 MainActivity.java
mkdir -p $WORK_DIR/java/com/mechaclash/app
cat > $WORK_DIR/java/com/mechaclash/app/MainActivity.java << 'JAVA'
package com.mechaclash.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );

        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN |
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );

        WebView webView = new WebView(this);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);

        setContentView(webView);

        webView.loadUrl("file:///android_asset/public/index.html");
    }
}
JAVA

# 编译 Java 文件
javac \
    -source 1.8 -target 1.8 \
    -bootclasspath $ANDROID_JAR \
    -d $WORK_DIR/obj/classes \
    $WORK_DIR/gen/com/mechaclash/app/R.java \
    $WORK_DIR/java/com/mechaclash/app/MainActivity.java \
    2>&1

echo "=== 4. 转换 DEX (d8) ==="
$BUILD_TOOLS/d8 \
    --lib $ANDROID_JAR \
    --output $WORK_DIR/obj \
    $WORK_DIR/obj/classes/com/mechaclash/app/*.class \
    2>&1

echo "=== 5. 打包 APK ==="
# 将 DEX 和 assets 加入 APK
cd $WORK_DIR/obj

# 复制 assets
mkdir -p assets
cp -r $WORK_DIR/assets/public assets/

# 使用 zip 添加所有文件
cd $WORK_DIR/obj
cp base.apk base_with_dex.apk
zip base_with_dex.apk classes.dex 2>&1 | tail -3
zip -r base_with_dex.apk assets/ 2>&1 | tail -3

# 对齐
echo "=== 6. 对齐 APK ==="
$BUILD_TOOLS/zipalign -v -p 4 $WORK_DIR/obj/base_with_dex.apk $WORK_DIR/obj/aligned.apk 2>&1 | tail -3

# 签名 (使用 debug keystore)
echo "=== 7. 签名 APK ==="
# 生成 debug keystore
if [ ! -f /workspace/debug.keystore ]; then
    keytool -genkey -v \
        -keystore /workspace/debug.keystore \
        -storepass android \
        -alias androiddebugkey \
        -keypass android \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=Android Debug,O=Android,C=US" \
        2>&1 | tail -3
fi

$BUILD_TOOLS/apksigner sign \
    --ks /workspace/debug.keystore \
    --ks-pass pass:android \
    --ks-key-alias androiddebugkey \
    --key-pass pass:android \
    --v1-signing-enabled true \
    --v2-signing-enabled true \
    --v3-signing-enabled true \
    --out /workspace/mecha-clash.apk \
    $WORK_DIR/obj/aligned.apk \
    2>&1

echo ""
echo "======================================"
echo "  APK 构建完成!"
echo "  /workspace/mecha-clash.apk"
echo "======================================"
ls -lh /workspace/mecha-clash.apk 2>&1
