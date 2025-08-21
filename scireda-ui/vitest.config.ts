import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts', './tests/setup.ts'],
    globals: true,
    css: true,
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
})


