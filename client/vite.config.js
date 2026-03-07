import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/complaints': 'http://localhost:5000',
      '/permissions': 'http://localhost:5000',
      '/assets': 'http://localhost:5000',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
