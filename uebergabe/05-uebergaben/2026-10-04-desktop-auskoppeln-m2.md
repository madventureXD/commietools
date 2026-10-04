# Übergabe: Desktop-Auskoppeln — M2 Aufnahme der Abhängigkeit

**Datum:** 2026-10-04
**Bearbeitet durch:** Faber (Hermes Agent, Team 2)
**Auftrag:** M2 des Vorhabens „Desktop-Erfahrung: Werkzeuge auskoppeln" — die in ADR 0007
beschlossene Bibliothek aufnehmen und durch die Prüfkette bringen (Go von Thomas am 2026-10-04).
**Status:** abgeschlossen

## Ziel der Sitzung

`@pip-it-up/core` so aufnehmen, dass die Lizenzordnung eingehalten wird und `npm run check` sowie
`npm run build` grün sind — mit gemessenen Zahlen statt Schätzungen.

## Ergebnis

**Die Aufnahme ist vollzogen und belegt.** Ein Paket, 1,8 s Installationszeit; geändert wurden nur
`apps/web/package.json` und `package-lock.json` (die Wurzel-`package.json` blieb unberührt).

**Der Lizenzweg war blockiert und wurde eng geöffnet.** `@pip-it-up/core` deklariert seine Lizenz
nicht im `package.json` — es hat kein `license`-Feld. Die Prüfung liest die Lizenz ausschließlich aus
`package-lock.json` und brach ab:

```
License audit failed: @pip-it-up/core@0.2.0 has no license expression in package-lock.json
```

Eine Durchsicht aller 523 erfassten Pakete zeigte: **dieses Paket ist der einzige Ausreißer.** Da
ADR 0001 verlangt, dass eine Lösung „vollständig in die Lizenzdatenbank aufgenommen werden kann",
wäre der Kandidat ohne einen Weg für diesen Fall an einem Muss-Kriterium gescheitert und
Eigenentwicklung zulässig geworden — obwohl die Lizenz gelesen und unstreitig MIT ist.

Gewählter Weg (ADR 0008): `licenses/overrides.json` mit einem **einzelnen, namentlich beschlossenen
Eintrag** für genau diese Version. Die Prüfung zieht ihn nur heran, wenn das Lockfile nichts liefert,
und nur wenn der **SHA-256 der Lizenzdatei** stimmt, die Version exakt passt und die Lizenz in
`policy.json` freigegeben ist. Herkunft sichtbar: `licenseSource: "reviewed-override"` im Register,
Zusatz „(from package LICENSE, reviewed)" in `THIRD_PARTY_NOTICES.md`.

**Gemessene Zahlen:**

- `npm run check`: grün — 523 Pakete, 16 vollständige Lizenztexte, 189 bewahrte Paketdokumente;
  Katalog 41 Werkzeuge, **3 Sprachen (de, en, es)**, 41 Symbole, 92 deklarierte Dateitypen;
  Typprüfung sauber; **339 Tests in 18 Dateien**.
- `npm run build`: grün; Bündelprüfung grün; **Startbündel 136.956 B gzip** von 204.800
  (Reserve rund 68 kB). Der Wert liegt **5 B unter** dem Referenzstand.
- Werkzeugtexte: de 26.972 / en 24.399 / es 26.054 B gzip bei Schwelle 30.720 — die Abweichungen
  zum Referenzstand (+569/+550/+603) stammen **nicht** aus dieser Arbeit; es wurde kein Text
  geändert.

## Geänderte Bereiche

- `apps/web/package.json` — Abhängigkeit `@pip-it-up/core: ^0.2.0`
- `package-lock.json` — Lockfile-Eintrag
- `licenses/overrides.json` — **neu**: der beschlossene Einzeleintrag mit Beleg-Hash
- `scripts/license-audit.mjs` — Ausnahmeweg gelesen, geprüft, `licenseSource` im Register,
  Vermerk in den Notices
- `licenses/registry.json`, `apps/web/public/licenses/registry.json`, `THIRD_PARTY_NOTICES.md` —
  erzeugt
- `uebergabe/04-entscheidungen/0008-lizenzfeld-fehlt-bei-pip-it-up.md` — **neu**
- `uebergabe/04-entscheidungen/README.md` — Entscheidungsindex

## Entscheidungen und Annahmen

- **Aufgenommen wird nur `@pip-it-up/core`, nicht die React-Bindung.** Die Notwendigkeit der
  React-Bindungen entscheidet sich in M3; `react >= 18` wäre mit React 19.2 des Projekts erfüllt.
- **Ausnahme statt Aufweichung** (ADR 0008): kein Sammel-Ausweg, keine Ableitung aus Lizenztexten,
  jede Ausnahme ein eigener datierter Beschluss mit Hashbindung. Künftige Kandidaten ohne Lizenzfeld
  sind **nicht** automatisch zulässig.
- **Annahme, ausdrücklich gekennzeichnet:** Die Bündelkosten der Bibliothek sind **noch nicht
  gemessen**. Das Startbündel ist sogar 5 B kleiner geworden, weil kein Code sie importiert. Die
  Zusage „passt ins Budget" stützt sich bisher nur auf die bekannte Reserve von rund 68 kB und die
  Paketgröße von 8,0 kB gzip — die echte Zahl entsteht in M3.
- **Bekannte Nebenwirkung:** Der Register-Diff umfasst rund 1100 Zeilen, weil `licenseSource` in
  allen 523 Einträgen steht. Inhaltlich gewollt (jede Lizenz weist ihre Herkunft aus); auf Wunsch
  auf „nur bei Ausnahmen" verkleinerbar.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | **grün** — Lizenz, Katalog, Typen, 339 Tests |
| `npm run build` | **grün** — inklusive `bundle:check` |
| `npm run licenses:generate` / `:check` | grün, 523 Pakete / 16 Texte / 189 Dokumente |
| `npm run lint` | **nicht ausgeführt** — kein Workspace-Skript vorhanden (`--if-present`) |
| `npm run viewport:check` | **nicht ausgeführt** — keine Oberfläche geändert; gehört zur Abnahme in M3 |
| `git diff --check` | sauber |
| Mutation 1: Beleg-Hash verfälscht | scheitert mit „override … is stale" — **wie erwartet** |
| Mutation 2: falsche Version im Eintrag | scheitert mit „has no license expression … and no reviewed override" — **wie erwartet** |
| Mutation 3: Eintrag entfernt | scheitert mit derselben Meldung — **wie erwartet** |
| Zeilenenden: alle fünf byteweise verglichenen Dateien auf CRLF gestellt | `licenses:check` bleibt **grün** — der Vergleich ist zeilenenden-unabhängig, der Commit damit auch in einem frischen Auschecken prüfbar |

## Offene Punkte und Risiken

- [ ] **Die Bündelkosten sind erst in M3 messbar.** 8,0 kB gzip Paketgröße gegen rund 68 kB Reserve —
      erwartet unkritisch, aber ungemessen.
- [ ] **Die Bibliothek ist „public beta" (0.2.0) mit Einzelentwickler.** Rückversicherung ist die
      MIT-Lizenz (Fork möglich); ADR 0007 hält das fest.
- [ ] **Die Fenstergröße bleibt unzugesichert** — Edge 154 übernimmt die Größe des aufrufenden
      Fensters. Gegenprobe in Chrome und Firefox steht aus.
- [ ] **Der Ausnahmeweg in `overrides.json` ist neu und noch nicht in einem zweiten Fall erprobt.**
      Er ist eng gefasst; ob er sich im Alltag bewährt, zeigt erst der nächste Kandidat.
- [ ] **Elf ältere Übergaben verfehlen die Vorlage** (Pflichtabschnitte fehlen). Gemeldet am
      2026-10-04, nicht angefasst — eigener Auftrag.

## Empfohlener nächster Schritt

**M3 — ein Werkzeug ausgekoppelt, vollständig** (beauftragt): Rahmen um die Werkzeugseite, Knopf,
Portal in das zweite Dokument, Stilführung inklusive Hell/Dunkel, Platzhalter mit Zurückholen,
Rückkehr bei `pagehide`. Die M0-Messung hat gezeigt, dass ein mit `append()` **verschobenes**
DOM-Element die React-Ereignisse verliert — der Portal-Weg ist deshalb nicht Geschmack, sondern
Voraussetzung. In M3 ist ausdrücklich zu belegen, dass der Werkzeugzustand beim Auskoppeln erhalten
bleibt (Instanz-Nachweis).

## Git

- Commit: `6395ab0` — „feat(desktop): adopt pip-it-up core behind a reviewed license exception
  (ADR 0008)"
- Vorherige Commits dieses Vorhabens: `789faef` (M0), `3b1eeea` (M1-Konzept), `d1c3588` (M1-Entscheidungen + ADR 0007)
- Arbeitsbaum: **sauber**
- **Nicht gepusht** — ein Push auf `main` löst das Cloudflare-Pages-Deployment aus und erfolgt nur
  auf ausdrücklichen Auftrag.
