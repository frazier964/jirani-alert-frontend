import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // open the full localhost URL so the browser lands on the app root
    open: 'http://localhost:5173',
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
    proxy: {
      // Run `vercel dev` from this frontend directory to serve the emergency API locally.
      '/api/emergency/trigger': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/emergency\/trigger$/, '/jiranialert/us-central1/activateEmergency').replace(/^\/api/, '/jiranialert/us-central1'),
      },
    },
  },
})
