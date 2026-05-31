import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  /* ── Build optimisations ── */
  build: {
    // Raise the inline asset threshold — SVG placeholders under 8kB inline as base64
    assetsInlineLimit: 8192,

    // Minify with esbuild (default, fastest)
    minify: 'esbuild',

    // Generate source maps for production error reporting
    // Set to false if hosting on a CDN without source-map support
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Core React runtime — tiny, loaded immediately
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
            return 'react-runtime';
          }

          // Router — loaded on every page
          if (id.includes('react-router') || id.includes('/cookie/') || id.includes('set-cookie-parser')) {
            return 'router';
          }

          // Three.js — large, only needed on homepage
          if (id.includes('/three/')) {
            return 'three';
          }

          // GSAP + Lenis — animation, only homepage
          if (id.includes('/gsap/') || id.includes('/lenis/')) {
            return 'animation';
          }

          // i18n — needed everywhere but can load after core
          if (id.includes('i18next') || id.includes('react-i18next') || id.includes('html-parse-stringify')) {
            return 'i18n';
          }

          // Icons — only small subset used, but tree-shaken at module level
          if (id.includes('react-icons')) {
            return 'icons';
          }

          // Toast notifications
          if (id.includes('react-hot-toast') || id.includes('goober')) {
            return 'ui';
          }

          // Axios + form-data
          if (id.includes('/axios/') || id.includes('form-data') || id.includes('follow-redirects')) {
            return 'http';
          }

          return 'vendor';
        },
      },
    },
  },

  /* ── Dev server ── */
  server: {
    port: 5173,
    open: false,
  },
})