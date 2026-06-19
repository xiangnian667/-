import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import legacy from '@vitejs/plugin-legacy';

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  server: {
    watch: {
      ignored: [
        '**/android-sdk/**',
        '**/android/**',
        '**/ios/**',
        '**/apk-build/**',
        '**/node_modules/**',
        '**/.pnpm-store/**',
      ],
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    tsconfigPaths()
  ],
})
