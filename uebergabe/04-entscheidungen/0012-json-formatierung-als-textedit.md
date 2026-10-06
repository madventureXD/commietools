# ADR 0012: JSON-Formatierung sind Textedits — `jsonc-parser` als neue Abhängigkeit, Werkzeug aus dem Startbündel gelöst

**Status:** angenommen  
**Datum:** 2026-10-06

## Kontext

Die Karte **M6-001** hält fest, was das Werkzeug „JSON formatieren" bisher tat: Es rief
`JSON.parse` und schrieb das Ergebnis mit `JSON.stringify` neu. Damit ist die Formatierung keine
Layoutänderung, sondern ein **neuer Wertestand** — und der weicht vom eingegebenen Dokument ab:

| Eingabe (gültiges JSON) | Ausgabe vorher | Ausgabe jetzt |
|---|---|---|
| `9007199254740993` | `9007199254740992` | `9007199254740993` |
| `1e309` | `null` | `1e309` |
| `1.2300` | `1.23` | `1.2300` |
| `-0` | `0` | `-0` |
| `"\u00e4"` | `"ä"` | `"\u00e4"` |

Angezeigt wurde dazu kein Hinweis. Die Gegenprobe über den alten Weg ist im Test festgehalten
(`apps/web/src/json-formatter.test.ts`, Mutationslauf am 2026-10-06).

Zugleich lag die Logik dieses Werkzeugs in `packages/tools/src/index.ts` — und **diesen Einstieg
importiert `apps/web/src/App.tsx` statisch**. Das Werkzeug gehörte damit zum Startbündel; eine
Bibliothek dort hätte jeder Besuch mitgeladen, auch wenn niemand JSON formatiert. Das verstößt
gegen ADR 0003 (datensparsame Ladegrenzen).

## Entscheidung

1. **Formatierung ist eine Layouttransformation.** Der Originaltext wird gelesen, es entstehen
   **Textedits** (Einrückung), und diese werden auf den Originaltext angewendet. Das parse-Ergebnis
   und die daraus gewonnenen Zahlenwerte werden **nie** serialisiert.
2. **`jsonc-parser` 3.3.1** (MIT, **ohne** eigene Abhängigkeiten, Microsoft) übernimmt Scanner,
   Validierung und Editberechnung. Die Prüfung ist streng: `disallowComments: true`,
   `allowTrailingComma: false`, und die Fehlerliste wird zwingend ausgewertet.
3. **Das Werkzeug liegt außerhalb des Startbündels.** Die Logik steht in
   `packages/tools/src/developer/json-formatter/format.ts` und ist über den eigenen Unterpfad
   `@commietools/tools/developer/json-formatter` erreichbar; der Paket-Einstieg `index.ts`
   reexportiert sie **nicht**. Die Oberfläche (`apps/web/src/tools/JsonFormatter.tsx`) lädt über
   `lazy()` wie die Werkzeuge ab den Rechnern.

## Gemessene Kosten (2026-10-06)

| Größe | Wert | Quelle |
|---|---|---|
| `jsonc-parser` voller Satz (`parse`, `format`, `applyEdits`, Fehlercode) | **4 506 B gzip** | `work/jsonc-messung.mjs` (esbuild, gzip -9) |
| nur Validierung | 3 290 B gzip | dieselbe Messung |
| Werkzeug-Chunk im Bau | 13,67 kB / **4,86 kB gzip** | `npm run build` |
| Startbündel vorher → nachher | 148 147 → **148 032 B gzip** | Bündelprüfung |

Das Startbündel wurde trotz neuer Bibliothek **115 B kleiner**: die alte Logik ist heraus, die neue
Last liegt vollständig auf der Werkzeugroute. Im Beleg nachgewiesen (`work/json-beleg.cjs`):
die Startseite lädt keinen Werkzeug-Chunk, das Startbündel enthält den Parser nicht, die
Werkzeugroute lädt ihn.

## Alternativen

- **Eigener JSON-Scanner** (Eigenbau): verworfen. Die Karte verbietet ausdrücklich einen
  „fragilen Zeichenketten-Regex-Formatter"; ein vollständiger, lexemtreuer Scanner ist ein
  eigenes Fehlerfeld (Escapes, Unicode, Zahlenbereich) bei geringem Nutzen gegenüber einer
  gepflegten MIT-Bibliothek ohne Abhängigkeiten.
- **`JSON.parse`/`stringify` behalten** und nur warnen: verworfen — die Karte verlangt den
  erhaltenen Textbestand, nicht einen Hinweis auf verlorene Daten.
- **Bibliothek im Startbündel lassen** (kleinster Umbau): verworfen wegen ADR 0003.

## Konsequenzen

- Das Werkzeug lädt beim ersten Öffnen kurz nach (`Suspense`-Hinweis), dafür trägt kein anderer
  Seitenaufruf die Last.
- `jsonc-parser` steht im Lizenzregister (`licenses/registry.json`, `THIRD_PARTY_NOTICES.md`) und
  durchläuft damit den regulären Prüflauf; die Projektlizenz bleibt unberührt.
- Der TextArea-Baustein liegt jetzt gemeinsam unter `apps/web/src/tools/text-area.tsx`, statt in
  jeder Werkzeugdatei abgeschrieben zu werden (Hinweis für M4-009).
- Offen: Die übrigen Werkzeuge der ersten Welle liegen weiterhin im Startbündel. Das ist hier
  **nicht** mitgeändert worden — der Umbau geschah nur, weil M6-001 eine neue Abhängigkeit
  mitbringt.
