# CommieTools.org

**Free tools for everyone. Your tools. Your device. Your data.**

CommieTools is a free, ad-free and privacy-oriented platform for practical digital tools. Whenever technically possible, files are processed on the user's device and tools continue to work offline.

## Principles

- **Local first:** user files stay on the device by default.
- **Offline first:** tools without live data dependencies work as an installable PWA.
- **Consistent:** every tool follows a shared input → settings → action → result flow.
- **Precise:** accessible controls, exact numeric input and clear feedback take priority over decoration.
- **Modular:** tools, UI, processing logic and translations are separate packages.
- **International:** no user-facing text is hard-coded in tool logic; a locale registry automatically drives language selection, fallback and text direction.

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
packages/i18n     Shared platform and suite translations
packages/tools    Tool manifests, implementations and tool-local translations
packages/ui       Shared design tokens and UI components
licenses          Verified machine-readable license database and policy
scripts           License generation and compliance checks
docs              Architecture and product decisions
uebergabe         AI- and human-readable project status, decisions and handoffs
```

Desktop and mobile shells are deliberately not scaffolded yet. They should consume the same packages after the web/PWA architecture has proved stable.

CommieTools is licensed under **GNU AGPL-3.0-only**. See [LICENSE](LICENSE).

Third-party open-source components are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the complete machine-readable [license registry](licenses/registry.json). The same verified registry is available in the web app at `/licenses` and works offline.

After changing dependencies, regenerate and review the registry:

```bash
npm run licenses:generate
npm run licenses:check
```

Both `npm run check` and `npm run build` fail when a package has no license, uses an unreviewed expression, lacks a complete SPDX text, or when generated licensing files are missing or stale.

## Current scope

The first executable slice is a bilingual, responsive, manifest-driven catalogue with six local tools and four curated suites. It establishes automatic routes, design tokens, theme handling, privacy classification and an offline shell without prematurely selecting server, database or native-app frameworks. The image metadata tool removes EXIF, XMP, IPTC and comment blocks without re-encoding the image, so the pixels stay byte-identical. The image resize tool scales, crops, rotates and mirrors with high-quality filtering in a web worker.

See [docs/architecture.md](docs/architecture.md) and [docs/ui-system.md](docs/ui-system.md).

## Collaboration and handoffs

The structured [project handoff area](uebergabe/README.md) is the entry point for humans and AI systems continuing the work. It records current status, open items, concepts, durable decisions, progress logs and session handoffs without duplicating the authoritative technical documentation.

