# License database

`registry.json` is the authoritative, generated license database for CommieTools. It covers every external package in `package-lock.json`, including development and optional platform dependencies.

Each package record contains its exact version, SPDX expression, dependency role, source metadata, and references to preserved package documents. Canonical SPDX texts are stored once in `licenses`; original `LICENSE`, `LICENCE`, `COPYING`, and `NOTICE` files are deduplicated by SHA-256 in `documents`.

`artifacts.json` declares embedded binary assets such as WebAssembly engines that contain upstream software not visible as separate npm packages. Generation verifies the local file, records its size and SHA-256 hash, resolves every component license to a complete SPDX text, and publishes the result in the same registry.

## Policy

`policy.json` is reviewed manually. A new license expression is never accepted automatically. Adding or updating a dependency with an unreviewed license makes generation, checks, and production builds fail.

## Workflow

1. Change dependencies with npm.
2. Run `npm run licenses:generate`.
3. Review changes to `policy.json`, `registry.json`, and `THIRD_PARTY_NOTICES.md`.
4. Run `npm run licenses:check`.

Never edit generated files manually. Package license texts and notices must remain complete and unmodified.
