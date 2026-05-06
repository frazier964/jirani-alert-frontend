import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // open the full localhost URL so the browser lands on the app root
    open: 'http://localhost:5173',
    port: 5173,
    strictPort: true,
  },
})
