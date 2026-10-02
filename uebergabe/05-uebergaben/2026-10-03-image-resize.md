# Übergabe: Werkzeug „Bild skalieren" gebaut

**Datum:** 2026-10-03 (Sitzung begann am 2026-10-02)  
**Bearbeitet durch:** Faber (Hermes Agent)  
**Status:** abgeschlossen

## Ziel der Sitzung

Zweites Werkzeug der Bild-Suite nach dem Konzept `03-konzepte/2026-10-02-bild-suite.md`:
Bilder skalieren, zuschneiden, drehen und spiegeln — lokal, offline und mit den
Projektvorgaben zu Lizenzierung, Sprache, Gestaltung und Prüfpflichten. Thomas hat den
technischen Weg ausdrücklich mir überlassen; die Lizenzordnung bleibt unangetastet.

## Ergebnis

Das Werkzeug ist gebaut, geprüft und benutzbar. Skalierung erfolgt mit hochwertiger Filterung
im Web Worker statt mit der einfachen Browser-Skalierung, Zuschnitt und Ausrichtung laufen
über Canvas. Der Ablauf ist festgelegt (Ausrichtung → Zuschnitt → Skalierung), damit
Vorschau, eingegebene Zahlen und Ergebnis nicht auseinanderlaufen können. Alles rechnet auf
dem Gerät; es gibt keinen Übertragungsweg.

Erste Abweichung vom Konzept in dieser Runde: Das Konzept sah `pica` bereits vor, deshalb ist
es keine Abweichung — die **Kostenannahme** war falsch und ist richtiggestellt (siehe unten).

## Geänderte Bereiche

- `packages/tools/src/image/resize/resize.ts` – Geometrie (Zielgröße, Zuschnitt, Drehung,
  Spiegelung, Vorschaumaß, Rahmenanteile)
- `packages/tools/src/image/resize/locales/{de,en,index}.ts` – werkzeugnahe Texte
- `apps/web/src/tools/imageResizeRender.ts` – Canvas- und pica-Darstellung
- `apps/web/src/tools/ImageResize.tsx` – Oberfläche
- `apps/web/src/App.tsx`, `apps/web/src/styles.css` – Route und Gestaltung
- `apps/web/src/image-resize.test.ts` – 18 Prüfungen der Geometrie
- `packages/tools/src/index.ts`, `packages/tools/src/locales.ts` – Manifest, Suite, Ausfuhren
- `README.md` – Werkzeugzahl berichtigt
- `licenses/registry.json`, `apps/web/public/licenses/registry.json`, `THIRD_PARTY_NOTICES.md`,
  `package-lock.json`, `packages/tools/package.json` – neue Abhängigkeit `pica` samt
  Hilfspaketen

## Entscheidungen und Annahmen

- **`pica` (MIT) wird eingesetzt**, weil echte Filterung und Auslagerung in einen Worker
  echten Eigenaufwand sparen. Sie bringt `glur` und `multimath` mit, beide MIT — die
  Lizenzordnung ist damit unberührt, alle drei Ausdrücke waren bereits zugelassen.
- **Vollbau statt Teilbau:** Der Teilbau von `pica` bräuchte eine Bündelung, bei der die
  Worker-Adresse über ein Paketkürzel aufgelöst werden müsste — im Vite-Aufbau unsicher. Der
  Vollbau bettet den Worker ein und erzeugt ihn über eine Blob-Adresse. **Folge für den
  offenen CSP-Punkt:** eine strenge Richtlinie braucht dann `worker-src blob:`. Der Teilbau
  samt eigener Worker-Datei ist der Weg dorthin und ist im Konzept vermerkt.
- **Zuschnitt über Zahlenfelder, nicht über Ziehen.** Das entspricht `docs/ui-system.md`
  (exakte Zahlen statt versteckter Gesten, Tastatur gleichwertig). Ziehen bleibt als
  zusätzlicher Bequemlichkeitsweg offen.
- **Grenze von 10.000 Pixeln je Kante wird gemeldet**, nicht still angewandt — eine stille
  Begrenzung wäre eine unangekündigte Planänderung.
- **Drehung setzt den Zuschnitt zurück**, weil der Zuschnitt auf das ausgerichtete Bild zeigt.
  Das ist die einzige Stelle, an der eine Eingabe durch eine andere verworfen wird; die
  Vorschau zeigt den Zustand sofort.
- **Angenommen, nicht geprüft:** Farbmanagement beim Speichern. Die Skalierung läuft über
  Canvas; ob ein ICC-Profil der Quelldatei erhalten bleibt, wurde nicht gemessen und steht
  als offener Punkt.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | bestanden; Typprüfung ohne Fehler, 40 Tests bestanden, Lizenzprüfung bestanden (478 Pakete, 12 Lizenztexte, 165 Paketdokumente) |
| `npm run build` | bestanden; Hauptbundle 412,43 kB (125,18 kB komprimiert), Stylesheet 14,32 kB (3,37 kB komprimiert), Vorab-Cache 8 Einträge (1.308,87 KiB) |
| `npm run licenses:generate` / `licenses:check` | bestanden; Lizenzdatenbank um die drei Pakete erweitert und mitgeliefert |
| echter Browser, echte 3840 × 2400 große JPEG-Datei | bestanden; Zielgröße 800 × 500, erzeugte Datei dekodiert als 800 × 500 px (54,7 kB), Drehung ergibt 2400 × 3840, keine Konsolenfehler |
| Zuschnittrahmen bei 1360 px und 420 px Fensterbreite gemessen | bestanden; Rahmenanteile entsprechen dem Zuschnitt in beiden Fällen |
| Prüfung gegen die geladene Programmfassung | bestanden; der Service-Worker-Cache wird vor dem Durchlauf entfernt und die geladene Bündeldatei mit der gebauten verglichen |

## Offene Punkte und Risiken

- [ ] **Farbprofil beim Speichern**: nicht gemessen, ob ein ICC-Profil erhalten bleibt.
- [ ] **CSP**: Der eingebettete Worker braucht `worker-src blob:`; für strenge Richtlinien
      auf den Teilbau wechseln.
- [ ] **Zuschnittrahmen ist nicht ziehbar**; nur Zahlenfelder. Bewusst so, aber für
      Mausbenutzer eine Komfortlücke.
- [ ] **Korrektur meiner Kostenangabe**: gemessen +21,27 kB komprimiert statt der im Konzept
      genannten ~15 kB. Für die weiteren Werkzeuge ist die Konzeptangabe entsprechend zu lesen.
- [ ] Ziehen des Rahmens und feste Seitenverhältnisse für den Zuschnitt sind noch offen.
- [ ] Barrierefreiheit ist handwerklich umgesetzt (Beschriftungen, `aria-pressed`,
      Mindestgrößen, Fokus), aber nicht automatisiert geprüft.

## Empfohlener nächster Schritt

1. Das nächste Werkzeug der Bild-Suite beginnt nach dem Konzept wieder mit Schritt 2:
   `icon-generator` (abhängigkeitsfrei, Selbstbedarf des Projekts) oder `image-watermark`
   (ebenfalls abhängigkeitsfrei). Beide sind kleiner als dieses Werkzeug. Vor der Wahl wäre zu
   klären, ob der offene CSP-Punkt vorher erledigt werden soll — er betrifft künftige
   Worker-lastige Werkzeuge.

## Git

- Commit: `b0809d2` (Umsetzung, Tests, Lizenzdatenbank, README-Berichtigung); dieser Bericht
  und das Fortschrittsprotokoll folgen im nächsten Commit
- Arbeitsbaum vor Commit: ausschließlich die oben genannten Bereiche
