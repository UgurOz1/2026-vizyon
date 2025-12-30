import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use base path only for production (GitHub Pages)
  base: mode === 'production' ? '/2026-vizyon/' : '/',
}))
