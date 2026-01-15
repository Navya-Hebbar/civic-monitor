import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to backend during development
      // This helps with CORS issues when running locally
      '/auth': {
        target: process.env.VITE_API_URL || 'https://civic-monitor.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/users': {
        target: process.env.VITE_API_URL || 'https://civic-monitor.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/issues': {
        target: process.env.VITE_API_URL || 'https://civic-monitor.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/admin': {
        target: process.env.VITE_API_URL || 'https://civic-monitor.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/geo': {
        target: process.env.VITE_API_URL || 'https://civic-monitor.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
