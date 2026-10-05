# Gesamtbericht: Welle B der Handwerkerwerkzeuge (Suite „Handwerk")

**Datum:** 2026-10-05  
**Bearbeitet durch:** Faber (Hermes Agent)  
**Auftrag:** Welle B umsetzen (Thomas, 2026-10-05): die vier Ausbau-Werkzeuge des Konzepts —
Fliesen, Farbe, Trockenbau, Bodenbelag. Arbeitsweise wie Welle A: Werkzeug für Werkzeug,
Zwischenbericht und Belegaufnahme je Werkzeug, keine Zwischenabnahme, Gesamtbericht am Ende.
**Status:** abgeschlossen

## Ergebnis in einem Satz

Vier Werkzeuge sind gebaut, geprüft, am Artefakt belegt und committet; die Suite „Handwerk" hat
damit **acht Werkzeuge** und 52 Werkzeuge stehen im Register.

| Werkzeug | ID | Rechenweg, der die Zahl trägt |
|---|---|---|
| Fliesen, Kleber und Fugenmörtel | `tiles` | Formatmaß → Stückzahl · Fugenlänge × Fuge × Tiefe × Dichte → Fugenmörtel · Zahnung/2 → Kleber |
| Farbe, Tapeten und Beschichtung | `paint` | Nettofläche → Anstrich über Ergiebigkeit · Tapete in **Bahnen** mit Rapportzuschnitt |
| Trockenbau | `drywall` | Platten **in Bahnen** · Profile über die Profilmeter · Schrauben und Spachtel je m² und Lage |
| Parkett, Laminat und Bodenbelag | `flooring` | Zuschlag nach Verlegeart → Pakete · Dämmung in Rollen · Sockelleisten aus dem Umfang |

## Was in dieser Welle gefunden wurde — und was es gekostet hat

1. **Zwölf Werkzeugoberflächen zeigten einen Sprachschlüssel statt Text** (im Beleg zu Werkzeug 1).
   Ursache: Die Sprachpaket-Aufteilung vom 2026-10-05 hatte `title`, `summary`, `description` und
   `terms` ins Suchpaket verschoben; Oberflächen, die ihren Kurztext über `t('tool.<x>.summary')`
   ausgeben, standen seither mit dem Schlüsselnamen da. `check` und `build` waren dabei grün.
   **Reparatur** an der richtigen Stelle (Werkzeugroute bekommt die vier Katalogschlüssel des
   aktiven Werkzeugs), **Wächtertest** `apps/web/src/catalogue-keys.test.ts`, **Prüfung der
   Prüfung** durch Mutation (entfernt → sie meldet genau `tool.<x>.summary`, Exit 2; zurückgenommen
   → 52 von 52 Routen sauber).
2. **Die Funktionsprüfung sah keine einzige Werkzeugroute an.** Sie prüfte vier Seiten. Erweitert
   auf alle Routen aus dem **erzeugten Register** (nicht aus dem DOM: ein erster Versuch sammelte
   `a[href^="/tools/"]` und fand **null** Routen — die Katalogkarten sind keine Links; die Prüfung
   lief grün durch, ohne etwas anzusehen).
3. **Drei eigene Rechenfehler vor dem Test gefunden** (Handrechnung am Beispiel, nicht der Test):
   zwei Einheitenfehler im Fliesenwerkzeug (Faktor 1000 an zwei Stellen), und im Trockenbau zwei
   **Modellfehler**: Öffnungen dürfen die Bahnenbreite nicht kürzen, und Profile werden über die
   Profilmeter gekauft. Alle drei stehen als Gegenprobe im Test.
4. **Die Summenschwelle der Werkzeugtexte** riss mit dem vierten Werkzeug. Nicht stillschweigend
   angehoben, sondern auf eine skalierende Regel umgestellt und als ADR 0011 dokumentiert.

## Prüfungen (Stand am Wellenende)

| Prüfung | Ergebnis |
|---|---|
| `npm run catalog:generate` | 52 Werkzeuge, 3 Sprachen, 52 Symbole, 3.464 Begriffe, 92 Dateitypen |
| `npm run check` | bestanden — **426 Tests in 28 Dateien**, Lizenz-, Register- und Typprüfung |
| `npm run lint` | bestanden |
| `npm run build` | bestanden, `bundle:check` bestanden, keine Warnung mehr |
| Funktionsprüfung alle Werkzeugrouten | **52 von 52 sauber**, kein Schlüsselwort statt Text |
| Belegaufnahmen (Edge headless) | 34 Aufnahmen der Welle, jeder Wert zurückgelesen und geprüft |
| Startlast | 146.867 B gzip von 204.800 (Reserve 57 kB) |
| Werkzeugtexte je Route | 5.199 B von 30.720 (unverändert seit der Aufteilung) |
| Werkzeugtexte gesamt | Deutsch 41.309 B · Englisch 37.278 · Spanisch 40.626 — je Paket 779/703/766 B, neue Regel ADR 0011 |

**Nicht geprüft in dieser Welle** (offen, siehe Übergabe): `npm run viewport:check`, der
durchgespielte Tastaturlauf, 200 % Zoom und Screenreader-Namen — dieselben Punkte, die schon für
die Rechner-Suite offen sind. Geprüft wurden je Werkzeug 1360 und 390 px, hell und dunkel, und
jede Route im Browser gelesen.

## Aufwand

Vier Werkzeuge, je eine Etappe (Fachlogik, Texte in drei Sprachen, Oberfläche, Tests, Register,
Prüflauf, Belegaufnahme, Protokoll). Wie angekündigt lag der Aufwand nicht in der Rechnung, sondern
in Prüfpflichten und Katalogpflege — und in diesem Fall zusätzlich in der Reparatur des
Sprachschlüssel-Fehlers, der zwölf Werkzeuge betraf.

## Empfohlener nächster Schritt

1. Welle C des Konzepts: Pflaster/Erdarbeiten (5) und Reifen/Drehmoment (24) — beide Klasse a,
   keine neue Abhängigkeit zu erwarten.
2. Vor der Veröffentlichung `npm run viewport:check` und den Tastaturlauf nachholen (beides steht
   seit der Rechner-Suite offen).
3. Veröffentlichung nur auf ausdrücklichen Auftrag — `main` löst das Cloudflare-Pages-Deployment aus.
