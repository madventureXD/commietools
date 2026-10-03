COMM IETOOLS M7 – ECHTE TESTDATEIEN
Erzeugt: 2026-10-03

ACHTUNG
Alle Schlüssel und Zertifikate in diesem Verzeichnis sind ausschließlich Wegwerf-Testdaten.
Nicht produktiv verwenden, nicht importieren und nicht als vertrauenswürdig einstufen.

Engine
Repository: https://github.com/StrategicProjects/pdf_signer
Commit: 6cc0218100d9ffc038f8dccee3b707e5bd136100
Crate: pdf_signer 0.3.2
Lizenz der Engine: GPL-3.0-or-later

Dateien
sample.pdf
  Unsignierte einseitige CommieTools-Basis-PDF, lokal mit pdf-lib erzeugt.
  Erwartung: keine Signatur vorhanden.

keystore.p12
  Selbstsigniertes RSA-Wegwerf-Testzertifikat aus dem Upstream-Testgenerator.
  Passwort: password
  Subject: CN=pdf_signer PoC,O=StrategicProjects,C=BR
  Erwartung: Zertifikat ist nicht vertrauenswürdig; nur für lokale Tests.

signed-reference.pdf
  sample.pdf, lokal mit PAdES B-B / ETSI.CAdES.detached signiert.
  Erwartung: mathematische Signatur gültig, Dokument unverändert, gesamte Datei abgedeckt,
  Vertrauenskette nicht bewertet beziehungsweise selbstsigniert/unbekannt.

signed-tampered.pdf
  Bitgenaue Kopie der signierten Referenz mit einem absichtlich veränderten Byte im signierten Bereich.
  Erwartung: Signatur ungültig, messageDigest mismatch, Dokument nach Signatur verändert.

Prüfung mit pdf_signer am Erzeugungstag
signed-reference.pdf:
  valid: true
  signer: CN=pdf_signer PoC,O=StrategicProjects,C=BR
  chain_trusted: n/a (no roots)
  covers_whole_document: true
  document_intact: true

signed-tampered.pdf:
  valid: false
  detail: signature verification failed: messageDigest mismatch
  document_intact: false

SHA-256
keystore.p12         02ED578B30E4B1B97AF518BC9FAC2F643ED9DCFCA33DA31721117AA8DD3AE9AC
sample.pdf           30C281F629E7EF76850B8162BB181C88BFE25CAC7894DA2DD7F38B7062120EFE
signed-reference.pdf B31C13C9DBE1A7B22225201BDBA599969C8EFF2B5178C33ABE9D13F45862AAED
signed-tampered.pdf  FF5EE14670A51986FE3C3EE6C4F57CEEFC6B2FFC6F05807C49382F664B8E9BF1

Offene Abschlussprüfung
- Adobe Acrobat Reader
- Poppler pdfsig
- EU DSS 6.5 lokal
- QPDF --check
- Browser-WASM-Prototyp nach erfolgreichem Port
