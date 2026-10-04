import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  optimizeDeps: { exclude: ['mupdf'] },
  build: {
    rollupOptions: {
      output: {
        /**
         * Die Kalenderrechnung braucht `@js-temporal/polyfill` nur dann, wenn der Browser kein
         * natives `Temporal` hat. Ohne festen Chunk-Namen ließe sich der Teil nicht gezielt vom
         * Vorabladen ausnehmen — er heißt sonst generisch `index.esm-*.js` und wird jedem
         * Besucher mitinstalliert (gemessen: 154 kB roh, ~46 kB gzip).
         */
        manualChunks: (id) => {
          if (id.includes('@js-temporal/polyfill')) return 'temporal'
          return undefined
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt,wasm}'],
        globIgnores: [
          '**/Pdf*.js',
          '**/ImagesToPdf-*.js',
          '**/pdf-*.js',
          '**/pdfUi-*.js',
          '**/pdfjs-*.js',
          '**/pdf-lib-*.js',
          '**/mupdf-*.js',
          '**/mupdf-*.wasm',
          '**/qpdf-*.js',
          '**/qpdf-*.wasm',
          '**/PdfTextOcr-*.js',
          '**/PdfCertificateTools-*.js',
          '**/engine-*.js',
          '**/engine_bg-*.wasm',
          '**/tesseract-*.js',
          '**/worker.min-*.js',
          '**/pdf.worker*.mjs',
          '**/temporal-*.js'
        ],
        runtimeCaching: [{
          urlPattern: /\/assets\/(?:Pdf|ImagesToPdf-|pdf-|pdfUi-|pdfjs-|pdf-lib-|mupdf-|qpdf-|engine-|engine_bg-|tesseract-|worker\.min-|pdf\.worker)/,
          handler: 'CacheFirst',
          options: { cacheName: 'commietools-pdf-engines-v2' }
        }, {
          // Wie die PDF-Engines: erst bei Gebrauch geholt, dann offline im Laufzeitcache.
          urlPattern: /\/assets\/temporal-/,
          handler: 'CacheFirst',
          options: { cacheName: 'commietools-calculator-engines-v1' }
        }]
      }
    })
  ]
})

