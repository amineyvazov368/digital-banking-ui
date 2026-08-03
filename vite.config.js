import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        // Backend local-da hansı portda işləyirsə onu yazın (məs: 5000, 8080 və s.)
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false,
      }
    }
  }
})