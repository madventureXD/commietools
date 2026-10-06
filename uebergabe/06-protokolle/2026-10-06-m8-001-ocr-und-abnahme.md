# Fortschrittsprotokoll: M8-001 — OCR-Ursache und Abnahmefälle

**Datum:** 2026-10-06
**Status:** teilweise — Ursache geklärt, OCR belegt, zwei Abnahmefälle offen
**Karte:** M8-001 aus R1 (`QM/70-reparaturempfehlungen/R1.md`)

## Umfang

Der bei Abschluss der ersten R1-Sitzung offen gebliebene Teil von M8-001: „Das OCR-Werkzeug meldet
für eine gültige Bildseite ‚Die PDF konnte nicht verarbeitet werden.' Der Fehlschlag tritt auch
ohne CSP auf, und der PDF-Viewer liest dieselbe Datei fehlerfrei." Dazu der Abnahmeabschnitt der
Karte: OCR einer bekannten Bildseite unter den gebauten Auslieferungsheadern mit den Fällen
Erfolg, abgelehnte Zustimmung, Abbruch, beschädigtes Modell, Offlinewiederholung.

## Ergebnisse

**1. Die Ursache war das Prüfmittel, nicht das Produkt.**

Die Konsolenmitschrift (`Runtime.consoleAPICalled`, `Log.entryAdded`, `Network.loadingFailed` —
Ausnahmen allein bleiben hier leer) zeigt:

```
Failed to load module script: The server responded with a non-JavaScript MIME type of
"application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.
```

`work/csp-server.mjs` kannte die Endung **`.mjs`** nicht und lieferte den pdf.js-Worker
(`pdf.worker.min-*.mjs`) als Binärstrom aus. Der Browser lehnt ein Modul-Skript mit falschem Typ
ab, pdf.js kann nicht arbeiten, das Werkzeug meldet den generischen PDF-Fehler (`tool.pdf.error.generic`)
— **unabhängig von der CSP**, genau wie in R1 beobachtet. Deshalb war die CSP-Spur eine Sackgasse.
Nach Ergänzung von `.mjs` in der MIME-Tabelle (und dem gezielten Beenden eines alten
Serverprozesses, der den Port hielt und weiter die alte Fassung auslieferte): OCR läuft.

**2. Belegte Abnahmefälle** (lokale Auslieferungskopfzeilen über `work/csp-server.mjs`):

| Fall | Ergebnis | Aufnahme |
|---|---|---|
| Erfolg | 329 Zeichen erkannt, „Gewinde" gefunden, keine Konsolenfehler | `ocr-erfolg.png` |
| Abgelehnte Zustimmung | „Bitte bestätige zuerst den einmaligen Download der Open-Source-OCR-Komponenten." | — |
| Abbruch | „Die Texterkennung wurde abgebrochen." | `abbruch.png` |

**3. Zwei Fälle konnte ich nicht belastbar herstellen — und sage das statt zu beschönigen.**

`Network.setBlockedURLs` (Modell/Core blockiert) und `Network.emulateNetworkConditions`
(offline) erreichen den **tesseract-Worker nicht**: In beiden Fällen lieferte die Seite nach 15 s
das volle Ergebnis (329 Zeichen), die OCR lief also mit Netz weiter. Die Messung sagt damit nichts
über den Fehlerfall aus. Aus einem Lauf mit kaltem Modell-Cache und abgeschaltetem Netz stammt die
Beobachtung, dass die Verarbeitung **165 s ohne Meldung, ohne Fortschritt und ohne Abbruch**
weiterlief — das ist ein **Verdacht, kein Befund**. Vorgeschlagener Nachweis: Edge mit
`--proxy-server` starten und einen kleinen Proxy die CDN-Hosts blocken lassen, damit die Anfragen
wirklich aus dem Worker-Kontext kommen.

**4. Zur Einordnung, wichtig für die Veröffentlichung:** Die **ausgelieferte** Seite scheitert
weiterhin (online geprüft) — dort blockt die alte CSP `script-src 'self'` den tesseract-Core von
jsdelivr. Die M8-001-Reparatur ist committet, aber **nicht gepusht**.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Erkannter Text (Erfolgslauf) | 329 Zeichen, „Gewinde" gefunden | `work/m8-001-ocr-diagnose.cjs` |
| Konsolenfehler im Erfolgslauf | 0 | dito |
| Laufzeit ohne Meldung (offline, kalter Cache) | 165 s, kein Ergebnis | `work/m8-001-abnahmefaelle.cjs` |
| Fehlerursache | MIME-Typ `.mjs` = `application/octet-stream` | Konsolenmitschrift |

## Relevante Verweise

- Karte: `QM/70-reparaturempfehlungen/R1.md`, Abschnitt M8-001
- Sonden: `work/m8-001-ocr-diagnose.cjs`, `work/m8-001-abnahmefaelle.cjs`,
  `work/m8-001-ocr-fehlerfall.cjs`, `work/csp-server.mjs`
- Aufnahmen: `06-protokolle/screenshots/2026-10-06-m8-001-ocr/`

## Folgemaßnahmen

- [ ] Beschädigtes Modell und Offlinewiederholung mit einem Proxy-Nachweis fahren (Vorschlag oben).
- [ ] Nach dem Push online gegenprüfen, dass OCR und Signaturprüfung unter der neuen CSP laufen.
- [ ] Prüfdienste: MIME-Tabelle bei jedem neuen Dienst gegen die Dateiendungen des Bündels abgleichen.