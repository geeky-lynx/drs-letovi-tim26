import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For Docker
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
