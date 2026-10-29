process.env.ROLLDOWN_WORKER_THREADS = process.env.ROLLDOWN_WORKER_THREADS || '2';
process.env.ROLLDOWN_MAX_BLOCKING_THREADS = process.env.ROLLDOWN_MAX_BLOCKING_THREADS || '2';
process.env.RAYON_NUM_THREADS = process.env.RAYON_NUM_THREADS || '2';

import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: false,
      navigationNotifier: false,
      analyticsTracker: Boolean(process.env.VITE_BASE44_APP_ID && process.env.VITE_BASE44_APP_ID !== 'undefined'),
      visualEditAgent: false
    }),
    react(),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
              return 'vendor-charts';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('@base44')) {
              return 'vendor-base44';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
          }
        },
      },
    },
  },
});
