# Architecture

## Decision status

This is a deliberately small foundation. Decisions that are expensive to reverse are documented here; backend, account, sync, native-shell and Rust/WASM choices remain open until a real tool requires them. *(Updated 2026-10-07: the Rust/WebAssembly bridge is no longer a deferred choice — it exists for the PDF signing engine, see "Actual state 2026-10-07" below. Backend, account, sync and native-shell choices remain open.)*

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

The catalogue is generated from manifests and locale catalogues rather than duplicated navigation data: `scripts/catalog-generate.mjs` writes the language-neutral `packages/tools/src/catalog/toolIndex.ts` plus one search and message module per language below `catalog/generated`, and `npm run check` fails when generated data is out of date or a declaration is incomplete (missing summary, missing terms, unknown file type, missing icon, inconsistent locale set, repeated or empty term, a hand-written `accept` list in a tool interface). Generated files are never edited by hand.

**Update 2026-10-05 (ADR 0010):** the tool-message side is no longer "one module per language". The
generator writes one **search** module per language (`catalog/generated/search/<locale>.ts`, holding
the catalogue keys — title, summary, description, terms, tags — loaded on every page), one **shared**
tool-message module per language (`catalog/generated/messages/<locale>/common.ts`) and one
tool-message module **per tool and language** (`catalog/generated/messages/<locale>/<toolId>.ts`),
fetched on that tool's route only. The tool → package map lives in `catalog/generated/textLoaders.ts`
outside the start bundle. `catalog:check` additionally fails on generated packages left behind after
a tool is renamed or removed. The sentence above dates from before that decision.

## Catalogue search

The search is a normalised substring match, not a ranking model: `packages/tools/src/catalog/search.ts` folds case, umlauts, accents and the sharp s. At runtime it searches the selected language plus English fallback; selecting English loads and searches English only. It compares terms, tags, title, summary and description as well as material derived from declarations (file types with and without the dot, category and suite). A fallback-language hit pays a fixed surcharge, so it ranks behind a curated hit in the selected language. Each result reports what it matched on. Two characters are the minimum, nothing is guessed, and an empty result appears only after the language pack is ready. The ranking table and surcharge live in `search.ts` and are covered by tests.

Suites are also manifest-driven. They reference tool IDs instead of copying tool code, so one tool may appear in multiple curated suites while retaining one implementation and one update path.

Execution modes communicate data handling:

- `local`: processing occurs on the device.
- `hybrid`: local processing may use previously downloaded data.
- `online`: a network service is required.

The UI must show this classification before users provide data.

## Offline model

The PWA service worker precaches the application shell and compiled assets. Tools that need large engines or datasets use **versioned, opt-in runtime caches** (see "Actual state 2026-10-07"): the PDF engines, the calculator engine and the language/tool text packages each have their own named cache and are fetched on use, never precached. *(Corrected 2026-10-07 — the earlier wording said these caches "will add … later"; they exist.)* User documents are never placed into a shared application cache. Persistent user data uses an explicit storage adapter (`packages/tools/src/storage/indexedStore.ts`, with the states `ok`/`unavailable`/`quota`/`invalid`) and stays separate from processing logic.

## Internationalization

Shared navigation, status, category and suite translations live in `packages/i18n`. Tool-specific translations live beside each tool under its own `locales` directory. The application merges both catalogs at runtime, falls back to English, and displays an unresolved key when a translation is missing. Manifests store translation keys, never display labels. Locale and regional preferences are separate concepts so units, paper sizes and time formats can evolve independently. Layout must remain compatible with right-to-left languages.

Language data is split by locale. The browser dynamically loads only the active locale and English
fallback (English alone when selected), caches it after use, and never precaches every language.
Compressed-size budgets are warning thresholds with a checked-in baseline; static optional
languages or heavy processing engines in the initial import graph remain hard build errors.

## Security and privacy defaults

- No analytics, advertising or telemetry dependencies.
- No upload path exists in the initial application.
- Browser APIs are accessed through narrow adapters when tool complexity requires them.
- Tool dependencies are reviewed for unexpected network access.
- Content Security Policy and deployment headers are added with the hosting configuration.

### Infrastructure error reports (Network Error Logging)

The hosting provider adds a **Network Error Logging** policy to every response of `commietools.org`.
It is set by Cloudflare, **not** by this repository (`apps/web/public/_headers` contains no such
header) and not by the application. Measured against the deployed site on 2026-10-07 18:34 UTC:

- `Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}` — **only failures** are
  reported; successful requests are not sampled.
- `Report-To`: group `cf-nel`, endpoint `https://a.nel.cloudflare.com/report/v4?s=…`, operated by
  Cloudflare.
- `max_age: 604800` (seven days): a policy already delivered to a browser stays in effect for that
  period, so a change is never immediate.

Three data flows are deliberately kept apart:

| Flow | Started by | What leaves the device | Recipient |
|---|---|---|---|
| Document processing in a tool | the user | nothing — it stays in the browser | nobody |
| Resource fetch (page, assets) | the browser | the request itself (IP address, URL); a few tools additionally load documented third-party resources, named by the CSP `connect-src` | Cloudflare (delivery), plus the named third-party hosts |
| Infrastructure error report (NEL) | the browser, after a delivery failure | failure metadata (URL, error kind, timestamp, client identifier) as documented by the operator | Cloudflare (`a.nel.cloudflare.com`) |

Keeping, changing or disabling this policy is a **hosting action** in the Cloudflare zone settings,
not a change in this repository; the operating steps and the verification are described in
`deployment-cloudflare-pages.md`. The application's own promise — no analytics, advertising or
telemetry dependency — is unaffected: no such module exists, and nothing here was added by the tools.

## Open-source-first implementation policy

CommieTools provides tools primarily by integrating suitable open-source solutions. Before a processing capability is implemented, maintained open-source libraries and applications must be researched and compared. An existing solution is preferred when it adequately satisfies the required function, browser or target-platform support, Local-/Offline-First operation, security, privacy, accessibility, performance and license compatibility.

Custom implementation is reserved for capabilities for which no adequate open-source solution exists, or where available solutions fail one of those requirements. The reason must be recorded in the relevant concept, handoff or ADR. Small CommieTools-specific adapters, user interfaces, validation, orchestration and compatibility layers are still expected: they connect the selected open-source engine to the shared tool contract without reimplementing the engine itself.

The required order for a new capability is therefore: define requirements, research open-source candidates, compare and prototype viable candidates, complete license and security review, then integrate the best candidate. Only after the comparison rejects all candidates may the missing capability be implemented in-house.

## Deferred decisions

- Node.js API and PostgreSQL schema
- accounts and settings synchronization
- cloud storage connectors
- Rust/WebAssembly tool engine boundary — **realized for the PDF signing engine** (see "Actual state 2026-10-07"); other engine classes still have no Rust boundary
- desktop and mobile wrappers
- third-party tool/plugin distribution

Deferring these avoids creating infrastructure before a validated tool requires it.

## Actual state 2026-10-07

*Added for card M11-001. Each boundary names its code anchor, its responsibility and the work that is
actually left. Measured on the delivered build of 2026-10-07, not planned.*

| Boundary | Code anchor | Responsibility | Open work |
|---|---|---|---|
| Browser app / lazy tool modules | `apps/web/src/App.tsx`, `packages/tools/src/catalog/generated/textLoaders.ts` | shell, routing, per-tool dynamic import of tool code and text packages | unchanged |
| PDF engines (JavaScript) | `packages/tools/src/pdf/m5.ts` (QPDF), `pdf/m7.ts` (Rust bridge), `pdfjs`/`mupdf` behind the PDF tool entry points | viewing, OCR, security, compression, repair | new engine classes need a size budget (rule already in `scripts/bundle-audit.mjs`) |
| **Rust/WebAssembly bridge** | `crates/pdf-signer-wasm` + `crates/pdf-signer-engine` → `packages/tools/src/pdf/m7-wasm/`, imported dynamically in `pdf/m7.ts:30` | PAdES B-B signing and verification, in memory, no network | **only the signing engine** has a Rust boundary; the release criteria of that engine are open (`04-entscheidungen/0014-m7-freigabekriterien.md`, status *proposed*) |
| Runtime caches | `apps/web/vite.config.ts` → `commietools-pdf-engines-v2`, `commietools-calculator-engines-v1`, `commietools-language-packs-v1` (`ignoreVary: true`) | fetch-on-use, danach Offline-Wiederverwendung **des bereits Geholten** — keine Zusage für den ersten Besuch oder einen Versionswechsel (M8-002) | a cache bump currently means editing the name by hand; no automated invalidation rule |
| Language/tool package granularity | `scripts/catalog-generate.mjs`, ADR 0010 / 0011 | one search pack, one shared text pack and one text pack **per tool and language** | — |
| Persistent user data | `packages/tools/src/storage/indexedStore.ts` | explicit storage states for calculator history, measurements and inspection intervals | not a general contract for future tools |

**Checked against the build configuration (2026-10-07):** all three cache names appear exactly once in
`vite.config.ts` and exactly once in the generated `apps/web/dist/sw.js`; the Rust bridge is reached
only through a dynamic `import()` and is not statically reachable from the start page.

## Evidence clarification, 2026-10-08: NEL fields

The earlier phrase "timestamp, client identifier" (revision
`77d38e51979cd9eff2813fe0d67b1e94ed5ca34b`) was too broad as a description of a measured
browser payload. No report body was observed in our controlled preview probe. The
[NEL specification](https://www.w3.org/TR/network-error-logging/) describes request URL,
method, referrer, protocol, server IP where available, status, phase, error type,
elapsed time and sampling fraction; the reporting envelope contains report age.
[Cloudflare's documentation](https://developers.cloudflare.com/network-error-logging/)
describes deriving ASN/country/metro information from the transport client IP and says
that it does not log that IP in its NEL pipeline. This is an operator statement, not
our independent inspection of receiver storage and not a claim about a persistent
application client identifier.

The own immutable audit preview was tested with fresh and subsequently reused disposable
browser profiles, unchanged seven-day policy, and a harmless offline request for
`build.json`. No reporting event or dispatch was observable within the recorded window.
The precise observation and revision are in
`uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/nel-preview.json`.

