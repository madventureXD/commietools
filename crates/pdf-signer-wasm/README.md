# CommieTools PDF signer WebAssembly adapter

This adapter pins `StrategicProjects/pdf_signer` 0.3.2 at commit
`6cc0218100d9ffc038f8dccee3b707e5bd136100` and exposes its in-memory PAdES B-B
signing and verification functions to the browser. Network timestamping and
trust-list downloads are deliberately not enabled.

Build prerequisites: Rust 1.99, the `wasm32-unknown-unknown` target, and
`wasm-bindgen-cli` 0.2.129. From the repository root run `npm run m7:build`.

The explicit `getrandom` dependencies and target configuration select the Web
Crypto-backed random source required by the upstream pure-Rust crypto stack.
