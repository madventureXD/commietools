# Übergabe 2026-10-05: Werkzeugtexte je Werkzeug

**Auftrag:** „2 go" — Hebel 2 aus der Sprachpaket-Reihe: die Texte nicht mehr je Sprache über alle
48 Werkzeuge, sondern je Werkzeug. Vorab war die Funktion „genauestens zu prüfen".

**Ergebnis in einem Satz:** Eine Werkzeugroute lädt nur noch die Texte ihres Werkzeugs plus ein
kleines gemeinsames Paket — 6.813 statt 52.333 B gzip im Rechnerbeispiel, bei unverändertem
Startbündel.

## Was gebaut wurde

1. **Erzeuger** (`scripts/catalog-generate.mjs`): schreibt je Sprache ein gemeinsames Paket
   (`messages/<sprache>/common.ts`) und ein Paket je Werkzeug
   (`messages/<sprache>/<werkzeug>.ts`). Die Zuordnung Schlüssel → Werkzeug geschieht über den
   längsten passenden Schlüsselpräfix (abgeleitet aus `titleKey`); alles ohne Werkzeugpräfix landet
   im gemeinsamen Paket. Titel, Beschreibung, Kurztext und Suchbegriffe bleiben ausschließlich im
   Suchpaket. Veraltete Paketdateien werden beim Erzeugen entfernt, und `check` meldet sie.
2. **Lader** (`generated/textLoaders.ts`, eigener Chunk): `loadCommonToolTexts`, `loadToolTexts`,
   `loadAllToolTexts` (letzteres für Prüfungen). Eigene Datei, damit die Verweiskarte über 147
   Module nicht im Startbündel liegt.
3. **Oberfläche**: Die Werkzeugroute holt die Textlader per `import('@commietools/tools/text-loaders')`
   und lädt die Texte ihres Werkzeugs. Die Kopfzeile nimmt Titel und Beschreibung aus dem Suchpaket
   (`apps/web/src/tool-texts.ts`). Die Bereitschaft hängt jetzt an **Sprache und Werkzeug**
   (`toolTextsTool`), damit beim Werkzeugwechsel keine fremden Texte aufblitzen.
4. **Bündelprüfung** (`scripts/bundle-audit.mjs`): Werkzeugtexte werden je Sprache summiert; geprüft
   wird zusätzlich die Last **je Route** (gemeinsames Paket + größtes Werkzeugpaket). Der
   Referenzstand (`scripts/bundle-size-baseline.json`) ist auf den neuen Stand gezogen.
5. **Chunk-Benennung** (`apps/web/vite.config.ts`): `tools-<sprache>-<werkzeug>`.
6. **Prüfungen**: Der Sammellader wird aus dem eigenen Einstieg geholt; die Rechner- und
   Katalogprüfungen sind auf die neue Struktur nachgeführt — die Rechnerprüfung prüft jetzt am
   Paket selbst, dass kein fremdes Werkzeug darin liegt.

## Belege

- **Netzbeleg** `work/hebel2-netzbeleg.cjs`, Ergebnis in `07-pruefung/hebel2/beleg.txt`: Startseite
  7 Dateien / 171.986 B gzip **ohne** Werkzeugtexte; Rechnerroute lädt `tools-de-common`,
  `tools-de-calculator` und die englischen Gegenstücke, **kein** fremdes Werkzeug; Bild-Metadaten
  lädt `tools-de-image-metadata` und **nicht** den Rechner.
- **Funktionsprüfung** `work/sprachpaket-funktionspruefung.cjs`: **0 Schlüsselnamen** auf
  Startseite, Werkzeugschublade, Suiten-Seite und Werkzeugroute; Titel auf der Werkzeugroute
  „Rechner".
- **Rechner-Beleg** `work/rechner-vier-werkzeuge-beleg.cjs`: 8 Proben über 4 Routen und 2
  Fensterbreiten, alle Werte zurückgelesen (1/3+1/6 = 0,5 · sin 30° = 0,5 · 255 = 0xff · 3 4 + 5 *
  = 35), kein Rechnerart-Umschalter.
- `npm run check`: 381 Prüfungen in 23 Dateien grün. `npm run build` grün. Bündelprüfung: Eingang
  146.408 B gzip.

## Was der Auftrag aufgedeckt hat (ehrlich)

Die verlangte Vorabprüfung der Funktion hat **zwei** Dinge gefunden, die kein vorhandener Beleg
gesehen hätte:

1. **Der vorige Schritt (Hebel 1) hatte den Katalog zerlegt**: Auf Startseite, Schublade und
   Suiten-Seite standen 22 Schlüsselnamen statt Text. Ursache und Behebung stehen in der Übergabe
   `2026-10-05-sprachpakete-beim-oeffnen-laden.md` (Commit `4caa7b8`).
2. **`ToolPage` hatte Haken nach einem Rückgabewert** — React brach nach dem Umbau den Aufbau ab,
   die Werkzeugseite blieb leer, obwohl `check` und `build` grün waren. Ursache: der zusätzliche
   Zustand `toolCatalogue` ließ den ersten Durchlauf zwei Haken ausführen. Behoben durch Verschieben
   aller Haken vor den Ladehinweis. Ohne die Prüfung der laufenden Seite wäre das in die
   Veröffentlichung gegangen.

## Offen

- **Nicht gepusht.** Ein Push löst die Bereitstellung aus — dafür braucht es Thomas' ausdrückliches
  Wort.
- Die Werkzeugtexte liegen jetzt 147-fach vor. Bei jeder Sprachänderung schreibt der Erzeuger sie
  neu; die Änderung ist damit größer in der Versionsverwaltung, aber erzeugt und geprüft.
- Nebenbei aufgefallen und **nicht** behoben: `suite.titleKey`/`descriptionKey` werden weiterhin aus
  dem Oberflächenpaket gelesen — dort liegen sie, das ist unverändert in Ordnung.