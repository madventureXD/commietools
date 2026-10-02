# CommieTools.org

**Free tools for everyone. Your tools. Your device. Your data.**

CommieTools is a free, ad-free and privacy-oriented platform for practical digital tools. Whenever technically possible, files are processed on the user's device and tools continue to work offline.

## Principles

- **Local first:** user files stay on the device by default.
- **Offline first:** tools without live data dependencies work as an installable PWA.
- **Consistent:** every tool follows a shared input → settings → action → result flow.
- **Precise:** accessible controls, exact numeric input and clear feedback take priority over decoration.
- **Modular:** tools, UI, processing logic and translations are separate packages.
- **International:** no user-facing text is hard-coded in tool logic; German and English are the first reference languages.

## Quick start

Requirements: Node.js 22 or newer.

```bash
npm install
npm run dev
```

For a production build and all checks:

```bash
npm run build
npm run check
```

## Repository layout

```text
apps/web          Web application and installable PWA
packages/core     Shared platform types and runtime contracts
packages/i18n     Locale definitions and translation resources
packages/tools    Tool manifests and implementations
packages/ui       Shared design tokens and UI components
docs              Architecture and product decisions
```

Desktop and mobile shells are deliberately not scaffolded yet. They should consume the same packages after the web/PWA architecture has proved stable.

The public licensing model is intentionally left undecided and must be selected before publication.

## Current scope

The first executable slice is a bilingual, responsive, manifest-driven catalogue with three local tools and two curated suites. It establishes automatic routes, design tokens, theme handling, privacy classification and an offline shell without prematurely selecting server, database or native-app frameworks.

See [docs/architecture.md](docs/architecture.md) and [docs/ui-system.md](docs/ui-system.md).

