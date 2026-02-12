import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget.tsx'),
      name: 'FocusTimer',
      fileName: 'focus-timer-widget',
      formats: ['iife'],
    },
    outDir: 'dist-widget',
    cssCodeSplit: false,
  },
  base: './',
})
