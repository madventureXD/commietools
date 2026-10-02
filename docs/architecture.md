# Architecture

## Decision status

This is a deliberately small foundation. Decisions that are expensive to reverse are documented here; backend, account, sync, native-shell and Rust/WASM choices remain open until a real tool requires them.

## Boundaries

```text
apps/web
  ├─ packages/ui       presentation primitives and design tokens
  ├─ packages/tools    manifests and pure/local tool logic
  ├─ packages/i18n     locales and messages
  └─ packages/core     shared contracts and capability metadata
```

Packages may depend on `core`. Tool logic must not depend on the web application. UI components must not perform file processing. This keeps future PWA, desktop and mobile shells able to reuse the same capabilities.

## Tool contract

Every tool has a serializable manifest: identity, category, translation keys, execution mode, resource class and offline capability. A tool also declares which files it reads and writes (`files.input`, `files.auxiliary` with a role, `files.output`); a tool without an input keeps no file field at all, and one that only produces information declares no output. File types are written as MIME types and resolved against `knownFormats` in `packages/core`, the single source for format names and extensions.

Two translation keys are mandatory per tool and must exist in every locale catalogue: a one-line `summaryKey` for result lists and cards, and a `termsKey` with comma-separated search terms, where a leading `#` marks a tag.

The catalogue is generated from manifests and locale catalogues rather than duplicated navigation data: `scripts/catalog-generate.mjs` writes `packages/tools/src/catalog/toolIndex.ts`, and `npm run check` fails when that file is out of date or when a declaration is incomplete (missing summary, missing terms, unknown file type, missing icon, inconsistent locale set, a hand-written `accept` list in a tool interface). The generated entries carry the searchable text of every language, so a later search can match a German query against English terms while showing results in the language the user selected.

Suites are also manifest-driven. They reference tool IDs instead of copying tool code, so one tool may appear in multiple curated suites while retaining one implementation and one update path.

Execution modes communicate data handling:

- `local`: processing occurs on the device.
- `hybrid`: local processing may use previously downloaded data.
- `online`: a network service is required.

The UI must show this classification before users provide data.

## Offline model

The PWA service worker precaches the application shell and compiled assets. Tools that need large engines or datasets will add versioned, opt-in caches later. User documents are never placed into a shared application cache. Persistent user data will use an explicit storage adapter (for example IndexedDB) and remain separate from processing logic.

## Internationalization

Shared navigation, status, category and suite translations live in `packages/i18n`. Tool-specific translations live beside each tool under its own `locales` directory. The application merges both catalogs at runtime, falls back to English, and displays an unresolved key when a translation is missing. Manifests store translation keys, never display labels. Locale and regional preferences are separate concepts so units, paper sizes and time formats can evolve independently. Layout must remain compatible with right-to-left languages.

## Security and privacy defaults

- No analytics, advertising or telemetry dependencies.
- No upload path exists in the initial application.
- Browser APIs are accessed through narrow adapters when tool complexity requires them.
- Tool dependencies are reviewed for unexpected network access.
- Content Security Policy and deployment headers are added with the hosting configuration.

## Deferred decisions

- Node.js API and PostgreSQL schema
- accounts and settings synchronization
- cloud storage connectors
- Rust/WebAssembly tool engine boundary
- desktop and mobile wrappers
- third-party tool/plugin distribution

Deferring these avoids creating infrastructure before a validated tool requires it.

