import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('react-router-dom')
          ) {
            return 'react-vendor'
          }

          if (
            id.includes('react-icons') ||
            id.includes('react-hot-toast')
          ) {
            return 'ui-vendor'
          }

          if (
            id.includes('i18next') ||
            id.includes('react-i18next')
          ) {
            return 'i18n'
          }

          return 'vendor'
        },
      },
    },
  },
})