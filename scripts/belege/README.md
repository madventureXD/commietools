# Belegskripte (`scripts/belege/`)

Diese Skripte erzeugen die **tragenden Belege** des Projekts. Sie lagen bis zum 2026-10-07 unter
`work/` — das ist durch die Projekt-`.gitignore` **nicht versioniert**, in einem frischen Checkout
also nicht vorhanden. Hier stehen sie **versioniert, portabel und mit ausdrücklicher
Voraussetzungsprüfung**. Grundlage: QM-Karte **M10-004** und die Entscheidung von Thomas vom
2026-10-06 (Punkt 6): *nur die tragenden Belegskripte* übernehmen.

Die **Wegwerfskripte** bleiben unter `work/` und werden bewusst nicht versioniert.

## Aufruf

```bash
npm run build                      # der Beleg misst den gebauten Stand
npx vite preview --host 127.0.0.1 --port 4173   # in einem zweiten Terminal
npm run beleg:sprachpakete         # Netzbeleg der Werkzeug-Textpakete
npm run beleg:rechner-kern         # Größe des mathjs-Rechenkerns je Rechnerart
```

`npm run build` ist für beide Läufe Pflicht — der eine misst die gebauten Dateien, der andere den
Modulordner. **Jeder Lauf prüft seine Voraussetzungen selbst** und bricht mit **Exit 2** und einer
benannten Ursache ab; Exit **1** ist dem Befund vorbehalten („Beleg nicht erbracht").

### Wenn `npm run build` im frischen Checkout scheitert

Gemessen am 2026-10-07 in einem frischen Checkout von `HEAD`: **`npm run build` bricht ab**, und zwar
an der **ersten** Stufe — `licenses:check`:

```
License audit failed: licenses\registry.json is incomplete or stale; run npm run licenses:generate
```

**Ursache, gemessen:** das committete `licenses/registry.json` von `HEAD` sagt weiterhin
`withNotices: 171 von 176` und `noticeMissing: true` für `pdf_signer`, **obwohl** der zugehörige
Hinweis `crates/pdf-signer-engine/LICENSE` in `HEAD` liegt (Auflage A3, 34.906 B). Das Register wird
im Arbeitsbaum lokal erzeugt und **bewusst nicht committet** — der so erzeugte Stand liegt damit
nicht in `HEAD`. **Das ist kein Fehler dieser Belegskripte**, sondern ein eigener Befund
(`01-stand/offene-punkte.md`, OP-064).

**Für die Belege genügt der Bau der Weboberfläche** — die Lizenzprüfung wird dabei nicht gebraucht:

```bash
npm run build --workspace @commietools/web   # erzeugt apps/web/dist
```

Damit laufen beide Belege auch im frischen Checkout. Voraussetzung bleibt `npm install` (bzw. ein
vorhandener `node_modules`-Ordner); der Ordner `work/` wird **nicht** gebraucht.

## Die Belege

| Skript | Was es belegt | Voraussetzungen |
|---|---|---|
| `sprachpakete-netzbeleg.mjs` | **Welche Dateien die Seite wirklich holt:** Startseite ohne Werkzeug-Textpaket, Werkzeugroute mit eigenem Paket und ohne fremdes. Grundlage der Sprachpaket-Aufteilung (ADR 0010/0011). | Edge/Chrome, `npm run build`, laufender Vorschaudienst |
| `rechner-kern-groesse.mjs` | **Größe des mathjs-Rechenkerns** je Rechnerart (roh und gzip). Grundlage der Zahlen in ADR 0005 / OP-011. | `npm install` (mathjs, esbuild) |
| `voraussetzungen.mjs` | Gemeinsame Voraussetzungs- und Aufräumhilfe der beiden Skripte. | — |

### Umgebungsvariablen

| Variable | Standard | Bedeutung |
|---|---|---|
| `COMMIETOOLS_PREVIEW_URL` | `http://localhost:4173` | Adresse des Vorschaudienstes. **`localhost`, nicht `127.0.0.1`** — `vite preview` lauscht hier auf `[::1]`. |
| `COMMIETOOLS_BROWSER` | erster gefundener Edge/Chrome | Programmdatei des Browsers. |
| `COMMIETOOLS_BELEG_AUSGABE` | `uebergabe/07-pruefung/hebel2` | Zielordner des Netzbelegs. |
| `COMMIETOOLS_BELEG_DATEI` | `beleg-<heutiges Datum>.txt` | Dateiname des Netzbelegs. Datierte Ausgabe: ein Lauf **überschreibt nie** einen früheren Beleg (Aktenregel „ergänzen statt umschreiben"). Der Beleg vom 2026-10-05 steht unverändert in `beleg.txt`. |

## Was bewusst **nicht** übernommen wurde

Grundlage ist die historische 18er-Liste aus `QM/20-messungen/M10/evidence.json`. Davon sind
**neun Screenshot-Erzeuger** (`ampel-shots`, `craft-shots`, `rechner-shots`, `paving-shots`,
`tires-shots`, `tiles-shots`, `paint-shots`, `drywall-shots`, `flooring-shots`) **nicht** übernommen:
sie sind durch den vorhandenen Prüfer `scripts/viewport-audit.mjs` (`npm run viewport:check`,
`npm run a11y:check`) **ersetzt** — derselbe Zweck, versioniert und über alle Routen des Registers.
Ebenso nicht übernommen: `werkzeugseite-diagnose.cjs` (Diagnosehilfe einer einzelnen Sitzung) und die
übrigen Wegwerfskripte unter `work/`.

**Nicht** übernommen wurde auch die Pauschalvariante: `work/` wird **nicht** entignoriert und private
Testdateien werden **nicht** hochgeladen („Nicht tun" der Karte). Lokal vorhanden ist nicht
verschwunden — aber erst hier ist es übergabefähig.

## Grenzen

- **Kein vollständiger Ersatz für `work/`.** Übernommen sind die **tragenden** Belege; die
  Sitzungsskripte der Wellen A–E (Screenshots, Einzelmessungen) liegen weiter dort und sind in einem
  frischen Checkout nicht vorhanden. Das ist die Entscheidung von Thomas, nicht ein Versehen.
- **Der Netzbeleg setzt Edge oder Chrome voraus.** Ein reiner Node-Lauf ist nicht möglich; fehlt der
  Browser, bricht das Skript mit Exit 2 ab, statt ein leeres Ergebnis als Erfolg auszugeben.
- **Der Vorschaudienst läuft nicht von selbst.** Fehlt er, bricht das Skript mit Exit 2 ab.
- **Die Belege werden nicht automatisch gefahren.** Sie sind Handarbeit vor einer Übergabe — sie
  gehören deshalb nicht in `npm run check` (dort läuft `npm run akte:check` für die Akte).

*Angelegt am 2026-10-07 im Durchzug der QM-Stufe R8. Portiert aus `work/hebel2-netzbeleg.cjs` und
`work/rechner-mathjs-messung.mjs`; fachlich unverändert, portabel gemacht (Umgebung statt fester
Rechnerpfade, Voraussetzungsprüfung, Aufräumen eigener Prozesse, datierte Ausgabedatei).*
