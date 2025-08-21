import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/scireda-api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
  },
})


