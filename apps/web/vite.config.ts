import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // TanStackRouterVite() // Disabled for now since we're using manual routing
  ],
  server: {
    port: 3000,
    host: '0.0.0.0', // Needed for Docker
    strictPort: false, // Allow fallback ports
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3001'),
  },
})
