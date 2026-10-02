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

Every tool has a serializable manifest: identity, category, translation keys, execution mode, resource class and offline capability. The catalogue is generated from manifests rather than duplicated navigation data.

Suites are also manifest-driven. They reference tool IDs instead of copying tool code, so one tool may appear in multiple curated suites while retaining one implementation and one update path.

Execution modes communicate data handling:

- `local`: processing occurs on the device.
- `hybrid`: local processing may use previously downloaded data.
- `online`: a network service is required.

The UI must show this classification before users provide data.

## Offline model

The PWA service worker precaches the application shell and compiled assets. Tools that need large engines or datasets will add versioned, opt-in caches later. User documents are never placed into a shared application cache. Persistent user data will use an explicit storage adapter (for example IndexedDB) and remain separate from processing logic.

## Internationalization

Translation resources live in `packages/i18n`. Manifests store translation keys, never display labels. Locale and regional preferences are separate concepts so units, paper sizes and time formats can evolve independently. Layout must remain compatible with right-to-left languages.

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

