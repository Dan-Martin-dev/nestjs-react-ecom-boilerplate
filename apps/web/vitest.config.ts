import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Cast to `any` to avoid type incompatibilities between different vite
  // versions present in the monorepo's node_modules.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react() as any],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    css: true,
  },
})
