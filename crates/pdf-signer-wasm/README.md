# CommieTools PDF signer WebAssembly adapter

This adapter vendors `StrategicProjects/pdf_signer` 0.3.2 from commit
`6cc0218100d9ffc038f8dccee3b707e5bd136100` in `../pdf-signer-engine`, including
CommieTools interoperability hardening for BER CMS and historical incremental
signatures, and exposes its in-memory PAdES B-B
signing and verification functions to the browser. Network timestamping and
trust-list downloads are deliberately not enabled.

Build prerequisites: Rust 1.99, the `wasm32-unknown-unknown` target, and
`wasm-bindgen-cli` 0.2.129. From the repository root run `npm run m7:build`.

The explicit `getrandom` dependencies and target configuration select the Web
Crypto-backed random source required by the upstream pure-Rust crypto stack.

## Build contract, 2026-10-08

`scripts/build-signer.mjs` requires Rust **1.99.0** and wasm-bindgen CLI **0.2.129**,
uses `--locked --offline --release`, and remaps workspace, Cargo and Rustup paths
before compilation. Populate a new Cargo cache with `cargo +1.99.0 fetch --locked
--manifest-path crates/pdf-signer-wasm/Cargo.toml` first. The script writes the
exact flags and binary SHA-256 in its target directory's `build-record.json`.
Optional arguments select a separate target directory and WASM output directory
inside the checkout. Windows is the reference release build platform; cross-platform
byte identity is not assumed. `scripts/fresh-checkout-audit.mjs` also verifies a
different checkout path, preserving the uncommitted candidate explicitly.

Windows builds additionally require a free `J:` drive letter. The build script
temporarily maps that letter to the current checkout using Windows `subst`, so
Cargo's path package identities use the same reference root. It refuses to replace
an existing drive, removes its own mapping after Cargo finishes, and keeps actual
output files inside the checkout. Source-path remapping alone was insufficient:
the first fresh-checkout comparison differed by 292 bytes despite equal strings.
