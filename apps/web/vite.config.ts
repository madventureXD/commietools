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
          const normalized = id.replaceAll('\\', '/')
          const searchLocale = /\/catalog\/generated\/search\/([a-z]{2,3}(?:-[A-Z]{2})?)\.ts$/u.exec(normalized)?.[1]
          if (searchLocale) return `search-${searchLocale}`
          // Je Werkzeug ein eigenes Paket (2026-10-05): `messages/<sprache>/<werkzeug>.ts`.
          const toolText = /\/catalog\/generated\/messages\/([a-z]{2,3}(?:-[A-Z]{2})?)\/([A-Za-z0-9_-]+)\.ts$/u.exec(normalized)
          if (toolText) return `tools-${toolText[1]}-${toolText[2]}`
          const uiLocale = /\/i18n\/src\/(?:common|suites)\/([a-z]{2,3}(?:-[A-Z]{2})?)\.ts$/u.exec(normalized)?.[1]
          if (uiLocale) return `ui-${uiLocale}`
          if (normalized.endsWith('/catalog/toolIndex.ts')) return 'catalog-base'
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
          '**/temporal-*.js',
          '**/search-*.js',
          '**/tools-*.js',
          '**/ui-*.js'
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
        }, {
          /**
           * Sprachpakete: erst bei Gebrauch geholt, dann offline im Laufzeitcache.
           *
           * `ignoreVary` ist hier **notwendig** und gemessen begründet (Karte M8-002): Ein
           * dynamischer `import()` stellt andere Anfrage-Kopfzeilen als ein `fetch()` auf dieselbe
           * Adresse. Trägt die gespeicherte Antwort ein `Vary`-Kopffeld, verweigert der
           * Cache-Treffer beim Modul-Import, die Anfrage fällt ins Netz — und ohne Netz scheitert
           * sie (`net::ERR_FAILED`), obwohl die Datei nachweislich im Cache liegt. Gemessen:
           * `fetch` auf dieselbe Adresse liefert 200 aus dem Cache, der Modul-Import scheitert;
           * ein Modul-Import einer Precache-Datei ist dagegen erfolgreich.
           */
          urlPattern: /\/assets\/(?:search|tools|ui)-[a-z]{2,3}(?:-[A-Z]{2})?-/,
          handler: 'CacheFirst',
          options: { cacheName: 'commietools-language-packs-v1', matchOptions: { ignoreVary: true } }
        }]
      }
    })
  ]
})

