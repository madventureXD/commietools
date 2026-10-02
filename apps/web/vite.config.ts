import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/pdfjs-dist')) return 'pdfjs'
          if (id.includes('node_modules/pdf-lib') || id.includes('node_modules/@pdf-lib') || id.includes('node_modules/pako')) return 'pdf-lib'
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CommieTools',
        short_name: 'CommieTools',
        description: 'Free, local-first tools for everyone.',
        theme_color: '#c91f2c',
        background_color: '#f6f7f9',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt}'],
        globIgnores: ['**/pdfjs-*.js', '**/pdf-lib-*.js', '**/pdf.worker*.mjs'],
        runtimeCaching: [{
          urlPattern: /\/assets\/(?:pdfjs-|pdf-lib-|pdf\.worker)/,
          handler: 'CacheFirst',
          options: { cacheName: 'commietools-pdf-engines-v1' }
        }]
      }
    })
  ]
})

