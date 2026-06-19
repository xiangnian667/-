import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mechaclash.app',
  appName: 'Mecha Clash',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;