import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@frontend': path.resolve(__dirname, './frontend'),
      '@components': path.resolve(__dirname, './frontend/components'),
      '@assets': path.resolve(__dirname, './frontend/assets'),
      '@css': path.resolve(__dirname, './frontend/css'),
      '@redux': path.resolve(__dirname, './frontend/redux')
    }
  }
})