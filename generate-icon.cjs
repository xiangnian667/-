// 像素风机甲对战图标生成器 (修复版)
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const SIZE = 32;
const pixels = new Array(SIZE * SIZE).fill('rgb(0,0,0)');

function rect(x, y, w, h, color) {
  for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) {
    const px = x + i, py = y + j;
    if (px >= 0 && px < SIZE && py >= 0 && py < SIZE) {
      pixels[py * SIZE + px] = color;
    }
  }
}

function drawMecha(x0, y0, main, dark, light) {
  rect(x0+4, y0+0, 4, 1, dark);
  rect(x0+3, y0+1, 6, 1, dark);
  rect(x0+2, y0+2, 8, 4, main);
  rect(x0+1, y0+3, 1, 2, dark);
  rect(x0+10, y0+3, 1, 2, dark);
  rect(x0+4, y0+3, 2, 1, '#ffffff');
  rect(x0+7, y0+3, 2, 1, '#ffffff');
  rect(x0+5, y0+5, 2, 1, dark);
  rect(x0+3, y0-1, 1, 1, main);
  rect(x0+8, y0-1, 1, 1, main);
  rect(x0+3, y0-2, 1, 1, light);
  rect(x0+8, y0-2, 1, 1, light);
  rect(x0+2, y0+6, 8, 1, dark);
  rect(x0+1, y0+7, 10, 5, main);
  rect(x0+2, y0+8, 8, 3, light);
  rect(x0+5, y0+9, 2, 2, '#ffff00');
  rect(x0+5, y0+9, 2, 1, '#ffffff');
  rect(x0+0, y0+7, 2, 3, dark);
  rect(x0+10, y0+7, 2, 3, dark);
  rect(x0+0, y0+10, 2, 4, main);
  rect(x0+10, y0+10, 2, 4, main);
  rect(x0-1, y0+13, 3, 2, dark);
  rect(x0+10, y0+13, 3, 2, dark);
  rect(x0+2, y0+12, 3, 6, main);
  rect(x0+7, y0+12, 3, 6, main);
  rect(x0+1, y0+18, 4, 2, dark);
  rect(x0+7, y0+18, 4, 2, dark);
}

function drawVS(cx, cy) {
  rect(cx+1, cy+1, 1, 1, '#ffffff');
  rect(cx, cy+1, 1, 1, '#ffff00');
  rect(cx+2, cy+1, 1, 1, '#ffff00');
  rect(cx+1, cy, 1, 1, '#ffff00');
  rect(cx+1, cy+2, 1, 1, '#ffff00');
  const sparks = [
    [0,-1,'#ffaa00'],[0,3,'#ffaa00'],[-1,0,'#ffaa00'],[3,0,'#ffaa00'],
    [-1,-1,'#ff6600'],[3,-1,'#ff6600'],[-1,3,'#ff6600'],[3,3,'#ff6600'],
    [-2,1,'#ffaa00'],[4,1,'#ffaa00'],[1,-2,'#ffaa00'],[1,4,'#ffaa00']
  ];
  sparks.forEach(([dx,dy,c]) => rect(cx+1+dx, cy+1+dy, 1, 1, c));
}

function initBackground() {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const t = y / SIZE;
      const r = Math.round(26 + (10-26)*t);
      const g = Math.round(26 + (10-26)*t);
      const b = Math.round(62 + (26-62)*t);
      pixels[y * SIZE + x] = `rgb(${r},${g},${b})`;
    }
  }
  for (let y = 0; y < SIZE; y += 2) {
    for (let x = 0; x < SIZE; x++) {
      pixels[y * SIZE + x] = 'rgb(0,0,0)';
    }
  }
}

initBackground();
rect(0, 0, SIZE, 1, 'rgb(255,51,68)');
rect(0, SIZE-1, SIZE, 1, 'rgb(51,153,255)');
rect(0, 0, 1, SIZE, 'rgb(102,102,102)');
rect(SIZE-1, 0, 1, SIZE, 'rgb(102,102,102)');
drawMecha(4, 8, 'rgb(255,51,68)', 'rgb(170,17,34)', 'rgb(255,136,153)');
drawMecha(20, 8, 'rgb(51,153,255)', 'rgb(17,68,170)', 'rgb(136,204,255)');
drawVS(14, 12);

// ====== 正确的 PNG 编码 (RGBA8) ======
function encodePNG(srcPixels, outSize) {
  const w = outSize, h = outSize;
  const scale = Math.floor(outSize / SIZE);

  // 调色板方式: 8-bit indexed color
  // 收集所有颜色
  const colorMap = new Map();
  const palette = [];
  function getColorIdx(color) {
    if (colorMap.has(color)) return colorMap.get(color);
    let r, g, b;
    if (color.startsWith('rgb(')) {
      const m = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
      r = +m[1]; g = +m[2]; b = +m[3];
    } else {
      r = parseInt(color.substr(1,2), 16);
      g = parseInt(color.substr(3,2), 16);
      b = parseInt(color.substr(5,2), 16);
    }
    const idx = palette.length;
    palette.push([r, g, b, 255]);
    colorMap.set(color, idx);
    return idx;
  }

  // 映射像素到索引
  const indexed = new Uint8Array(SIZE * SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    indexed[i] = getColorIdx(srcPixels[i]);
  }

  // 放大像素数据 (使用最近邻)，保证尺寸精确
  const outW = w, outH = h;
  const raw = Buffer.alloc(outH * (1 + outW));
  let off = 0;
  for (let y = 0; y < outH; y++) {
    raw[off++] = 0; // filter
    for (let x = 0; x < outW; x++) {
      const sx = Math.min(SIZE - 1, Math.floor(x * SIZE / outW));
      const sy = Math.min(SIZE - 1, Math.floor(y * SIZE / outH));
      raw[off++] = indexed[sy * SIZE + sx];
    }
  }

  const idat = zlib.deflateSync(raw);

  // CRC32 表
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  // IHDR (8-bit indexed color)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(outW, 0);
  ihdr.writeUInt32BE(outH, 4);
  ihdr.writeUInt8(8, 8);   // bit depth
  ihdr.writeUInt8(3, 9);   // color type = palette
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  // PLTE
  const plte = Buffer.alloc(palette.length * 3);
  palette.forEach(([r,g,b], i) => {
    plte[i*3] = r; plte[i*3+1] = g; plte[i*3+2] = b;
  });

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('PLTE', plte),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const resolutions = [
  { name: 'mipmap-mdpi', size: 48 },
  { name: 'mipmap-hdpi', size: 72 },
  { name: 'mipmap-xhdpi', size: 96 },
  { name: 'mipmap-xxhdpi', size: 144 },
  { name: 'mipmap-xxxhdpi', size: 192 },
];

const outDir = path.join('/workspace', 'icons-output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

resolutions.forEach(({name, size}) => {
  const buf = encodePNG(pixels, size);
  const file = path.join(outDir, `${name}.png`);
  fs.writeFileSync(file, buf);
  console.log(`✓ ${file} (${size}x${size}, ${buf.length} bytes)`);
});

fs.writeFileSync(path.join(outDir, 'ic_launcher.png'), encodePNG(pixels, 192));
console.log('Done!');
