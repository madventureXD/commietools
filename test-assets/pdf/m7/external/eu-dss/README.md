# EU-DSS-Referenzkorpus für M7

Unveränderte Auswahl aus dem öffentlichen Testbestand des von der Europäischen
Kommission gepflegten Digital Signature Service (DSS).

- Repository: https://github.com/esig/dss
- Revision: `c8aea1f90958a851f651fe39f1575fcbd6d4a11d`
- Quellpfad: `dss-pades/src/test/resources/validation/`
- Lizenz: LGPL-2.1-or-later; vollständiger Text in `LICENSE.eu-dss.txt`
- Übernommen: 2026-10-03

Die Dateien dürfen nicht als aktuell vertrauenswürdige Zertifikate verstanden
werden. Sie prüfen Parser, CMS-Integrität, ByteRange, inkrementelle Revisionen,
Zeitstempel und Veränderungserkennung. Der Test `node
scripts/m7-eu-dss-audit.mjs --write` erzeugt `commietools-results.json` neu.

## Erwartung und CommieTools-Ergebnis

| Datei | Referenzzweck | Ergebnis M7 |
|---|---|---|
| `pdf-signed-original.pdf` | gültige einfache Signatur | bestanden: gültig und intakt |
| `pdf-signed-corrupted.pdf` | beschädigte ByteRange/Signatur | bestanden: nicht gültig; derzeit keine Signaturinstanz extrahiert |
| `pdf-signed-out-of-byteRange.pdf` | ByteRange außerhalb der Datei | bestanden: abgelehnt |
| `pdf-byterange-overlap.pdf` | eine gültige und eine fehlerhafte Signatur | bestanden: beide erkannt, Gesamtergebnis ungültig |
| `pdf-signed-added-page.pdf` | nachträglich hinzugefügte Seite | bestanden: CMS gültig, Dokument verändert |
| `pades-signed-annot-added.pdf` | nachträglich hinzugefügte Annotation | bestanden: CMS gültig, Dokument verändert |
| `BadEncodedCMS.pdf` | ungültig kodiertes CMS | bestanden: sicher abgelehnt |
| `hello_signed_INCSAVE_signed.pdf` | zwei inkrementelle Signaturen | abweichend: zwei Strukturen erkannt, CMS-DER nicht gelesen |
| `hello_signed_INCSAVE_signed_EDITED.pdf` | zwei Signaturen, davon eine beschädigt | abweichend: Strukturen erkannt, Zustände nicht differenziert |
| `doc-firmado-T.pdf` | PAdES-T | abweichend: CMS-DER nicht gelesen |
| `doc-firmado-LT.pdf` | PAdES-LT | abweichend: CMS-DER nicht gelesen |
| `PAdES-LTA.pdf` | PAdES-LTA | teilweise: Dokumentzeitstempel gültig, Hauptsignatur nicht gelesen |
| `pades-5-signatures-and-1-document-timestamp.pdf` | fünf Signaturen und Zeitstempel | abweichend: Signaturen nicht strukturell extrahiert |

Die Abweichungen sind Freigabesperren, keine akzeptierten Einschränkungen. Die
Oberfläche meldet bei erkannter, aber nicht auswertbarer Signaturstruktur nun
ausdrücklich „nicht geprüft“ statt „keine Signatur“.

## SHA-256

```text
08a33cdbf5b278673a014dfef524cd029fd13c2a286c1deeb91d9c4b60e5ade1  BadEncodedCMS.pdf
130ff45493c0cff873b44662bf9bb609820fabe4a0e666604ae1ac2795059eaf  doc-firmado-LT.pdf
cdac360bb3f545ecd6dbc6f622511e3d06e5aca7e77ce2243d7806e18721ba35  doc-firmado-T.pdf
cf1ab7b64dc49ee47d101133a57cc51e604eb23dbabb2075732d41804831aba9  hello_signed_INCSAVE_signed_EDITED.pdf
af63353c955aaa66612d87e7340d19726b8127a138fd393dd67840c1dc905625  hello_signed_INCSAVE_signed.pdf
962dd61443f8c124aa029bef2d2150712ed2bc895b2646f38af5f0f9d7bedc8e  pades-5-signatures-and-1-document-timestamp.pdf
876e78f407e0c163f2e6d7dd23d0f3bbcd382027de18278fa8787eab80727cda  PAdES-LTA.pdf
cd20365310578663d2f289713de914fb8d5021ed1a801e87ff80c7b7939a1c52  pades-signed-annot-added.pdf
92212d423c94c8bb4431348b194590f6844c927638f7db835d180adb0a676451  pdf-byterange-overlap.pdf
467573be2135cb83c17e450a1ea7992f087d79d4f18f5386509020901da7a2ec  pdf-signed-added-page.pdf
8be92f00f5354f6b88f692872c4f40cb4eea21d81b474942ce545dde93aadd05  pdf-signed-corrupted.pdf
2f575aa24dcb5f15e5e81512d396d934a055830c5b8fe4b09868a6c9af19a330  pdf-signed-original.pdf
bf3efb114dcd72cfcc6cbb77b33921ed8b8d445f0c5567b21deb791808b81829  pdf-signed-out-of-byteRange.pdf
```
