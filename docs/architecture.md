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

Generated files cross one web-shell adapter before they reach the user's file system. Tool logic
produces bytes or blobs and proposes a name; the adapter normalises that name, invokes the native
save picker when the browser supports it and otherwise performs a normal browser download. Tool
logic must not call browser download libraries or create its own download anchors.

## Tool contract

Every tool has a serializable manifest: identity, category, translation keys, execution mode, resource class and offline capability. A tool also declares which files it reads and writes (`files.input`, `files.auxiliary` with a role, `files.output`); a tool without an input keeps no file field at all, and one that only produces information declares no output. File types are written as MIME types and resolved against `knownFormats` in `packages/core`, the single source for format names and extensions.

Two translation keys are mandatory per tool and must exist in every locale catalogue: a one-line `summaryKey` for result lists and cards, and a `termsKey` with comma-separated search terms, where a leading `#` marks a tag.

The catalogue is generated from manifests and locale catalogues rather than duplicated navigation data: `scripts/catalog-generate.mjs` writes `packages/tools/src/catalog/toolIndex.ts`, and `npm run check` fails when that file is out of date or when a declaration is incomplete (missing summary, missing terms, unknown file type, missing icon, inconsistent locale set, repeated or empty term, a hand-written `accept` list in a tool interface). The generated entries carry the searchable text of every language, so a later search can match a German query against English terms while showing results in the language the user selected.

## Catalogue search

The search is a normalised substring match, not a ranking model: `packages/tools/src/catalog/search.ts` folds case, umlauts, accents and the sharp s, then compares the query against the curated text of **every** language (terms, tags, title, summary, description) and against material derived from the declarations (declared file types with and without the dot, category, suite — the latter two resolved in the selected language). A hit that exists only in another language pays a fixed surcharge, so it ranks behind a curated hit of the selected language but ahead of a vague substring in a sentence. Each result reports what it matched on; a hit inside a long sentence is reported with the single word. Two characters are the minimum, nothing is guessed, and an empty result is stated as such. The ranking table and the surcharge live in one place in `search.ts` and are covered by tests.

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

## Open-source-first implementation policy

CommieTools provides tools primarily by integrating suitable open-source solutions. Before a processing capability is implemented, maintained open-source libraries and applications must be researched and compared. An existing solution is preferred when it adequately satisfies the required function, browser or target-platform support, Local-/Offline-First operation, security, privacy, accessibility, performance and license compatibility.

Custom implementation is reserved for capabilities for which no adequate open-source solution exists, or where available solutions fail one of those requirements. The reason must be recorded in the relevant concept, handoff or ADR. Small CommieTools-specific adapters, user interfaces, validation, orchestration and compatibility layers are still expected: they connect the selected open-source engine to the shared tool contract without reimplementing the engine itself.

The required order for a new capability is therefore: define requirements, research open-source candidates, compare and prototype viable candidates, complete license and security review, then integrate the best candidate. Only after the comparison rejects all candidates may the missing capability be implemented in-house.

## Deferred decisions

- Node.js API and PostgreSQL schema
- accounts and settings synchronization
- cloud storage connectors
- Rust/WebAssembly tool engine boundary
- desktop and mobile wrappers
- third-party tool/plugin distribution

Deferring these avoids creating infrastructure before a validated tool requires it.

