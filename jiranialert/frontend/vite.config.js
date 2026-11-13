import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const useEmulators = String(env.VITE_USE_FIREBASE_EMULATORS || '').trim().toLowerCase() === 'true'
  const backendTarget = useEmulators
    ? 'http://127.0.0.1:5005'
    : String(env.VITE_FUNCTIONS_BASE || env.VITE_BACKEND_URL || 'https://us-central1-jiranialert.cloudfunctions.net').replace(/\/+$/, '')
  const backendPathPrefix = useEmulators ? '/jiranialert/us-central1' : ''

  return {
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
        target: backendTarget,
        changeOrigin: true,
        rewrite: (requestPath) => {
          const path = requestPath.replace(/^\/api/, '')
          if (path === '/emergency/trigger') return `${backendPathPrefix}/activateEmergency`
          return `${backendPathPrefix}${path}`
        },
        },
      },
    },
  }
})
