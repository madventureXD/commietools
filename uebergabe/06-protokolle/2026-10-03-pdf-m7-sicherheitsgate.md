# Fortschrittsprotokoll: PDF-Suite M7 – Sicherheitsgate

**Datum:** 2026-10-03  
**Ergebnis:** keine unsichere Integration; M7 bleibt gesperrt

## Geprüft

- MuPDF.js 1.28.1: Browserwrapper exportiert keine Signatur-API.
- `@signpdf/signpdf`, `@signpdf/signer-p12` und `@signpdf/placeholder-pdf-lib` 3.3.0: P12-Signaturpfad vorhanden, aber Node-orientiert.
- `node-forge` 1.4.0: ungepatchte High-Severity-Schwachstelle `GHSA-86w9-cpqp-85rv` im RSA-PKCS#1-v1.5-Prüfpfad; npm meldet keinen verfügbaren Fix.
- PKI.js und jüngere Browserprojekte: technisch grundsätzlich interessant, aber aktuell keine hinreichend belastbare allgemeine P12/PDF-Signatur- und Vertrauensprüfung für eine öffentliche Freigabe.

## Maßnahmen

- testweise installierte `@signpdf`-, `node-forge`- und Browser-Polyfill-Pakete vollständig entfernt
- `npm audit` danach wieder ohne bekannte Schwachstellen
- ADR 0004 mit zehn verbindlichen Freigabegates angelegt
- Roadmap so geändert, dass M8 unabhängig von M7 fortgesetzt werden kann

Es wurden weder Produktcode noch ein scheinbar funktionsfähiges Signaturwerkzeug eingecheckt. Das ist eine bewusste Sicherheitsentscheidung, kein stilles Verschieben der Anforderungen.
