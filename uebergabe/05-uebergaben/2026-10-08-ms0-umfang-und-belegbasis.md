# Übergabe: MS0 — Umfang und Belegbasis

**Datum:** 2026-10-08  
**Bearbeitet durch:** Codex  
**Auftrag:** Thomas: „Ms0 go“ — Umfang, Kriterien, offene Karten und externe Abnahmeplanung festhalten.  
**Status:** teilweise

## Ziel der Sitzung

MS0 des Fertigstellungskonzepts ausführen: alle 59 Karten zuordnen, 26 offene Karten erfassen,
neun F-Karten wieder öffnen, ursprüngliche D/E-Kriterien und Freigabegrenzen sammeln sowie
Prüfverantwortlichkeiten und Zeitpunkte planen.

## Ergebnis

Lokale Kriterien-/Zuordnungsarbeit erstellt: [MS0-Basis](../07-pruefung/fertigstellung/2026-10-08-ms0/README.md).
59 IDs, 33 B / 16 R / 9 F / 1 O; exakte Originalabnahmen und Abgrenzungen, 23 byteidentische
Textquellen mit SHA-256, acht D/E-Funktionen mit Originalkriterien und aktuellen Kennungen.
Neun F-Karten sind im aktuellen Leitfadennachtrag wieder geöffnet; keine Karte administrativ
als fachlich abgenommen umgedeutet.

**Nicht erfüllter MS0-Exit:** konkrete Prüfer, Geräte und Zugänge sind noch nicht reserviert.
Rollen und Milestone-Fenster stehen im Abnahmeplan; Personen/Verfügbarkeit bleiben offen
(OP-066). Hierzu wurde eine kurze Nutzerfrage gestellt. Ohne Bestätigung wird keine Buchung behauptet.

## Geänderte Bereiche

- `uebergabe/07-pruefung/fertigstellung/2026-10-08-ms0/` — neue eingefrorene Karten-/Quellenbasis, Funktionsumfang und Abnahmefenster.
- `scripts/belege/fertigstellung-basis.mjs`, Beleg-README — portable Integritäts-/Zuordnungsprüfung.
- `uebergabe/00-einstieg/vorgehen-qm-audit.md` — aktueller fachlicher Nachtrag, neun F-Karten erneut offen.
- `uebergabe/01-stand/{aktueller-stand,offene-punkte,abschlussmatrix}.md` — datierte Nachträge, OP-065/066 und D-Kriteriumskorrektur.
- Fertigstellungskonzept vom 2026-10-07 — MS0-Beauftragung und organisatorischen Rest als Nachtrag dokumentiert.
- Diese neue Sitzungsübergabe; keine Produktdatei oder Abhängigkeit verändert.

## Entscheidungen und Annahmen

- „Ms0 go“ beauftragt MS0; keine neuen externen Lizenz-/Risiko-/Hostingentscheidungen.
- Thomas ist gemäß bestehender Projektrolle Betreiber/Koordinator. Unabhängiger Autor/Prüfer und Geräte-/Fachpersonen sind vorgeschlagen, nicht beauftragt.
- Relative Milestone-Fenster sind vorgesehene Zeitpunkte, keine bestätigten Kalendertermine.
- Originalkarten und Quellen bleiben unverändert; Kopien dienen der dokumentierten Kriterienbasis.
- Die frühere pauschale Aussage fehlender A–D-Kriterien wird für D anhand des vorhandenen Plans eingegrenzt. Der aktuelle Protokoll-Toolname ist `handover-report`, Prüffristen heißen `inspection`.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `git status --short`, `git rev-parse HEAD` | ausgeführt, Exit 0; unveränderte Basis `556159f58ac3beac3b6349851dae7326558b7fbb`; Konzeptänderungen der vorigen Sitzung vorhanden und erhalten |
| `node scripts/belege/fertigstellung-basis.mjs` | Exit 0: 59 Karten, 26 offen, acht Befunde, 23 Quellen, acht D/E-Werkzeuge; nach vollständiger Kriterien-/Statuskontrolle erneut bestanden. Beleg: `QM/82-ms0-2026-10-08/basis-pruefung.json` |
| Aufruf aus anderem Arbeitsverzeichnis (`tmp/`) | Exit 0; Wurzel wird aus dem Skriptort aufgelöst; kein ursprüngliches `QM/` benötigt. Kein behaupteter Zweitrechnerlauf |
| Originalquellen / Übergabevorlage | `node tmp/ms0-finalqa.mjs`, Exit 0; alle 23 Originaldateien haben weiterhin ihre aufgenommenen Hashes; Kopffelder und Abschnitte in Vorlagenreihenfolge. Beleg: `QM/82-ms0-2026-10-08/dokumentkontrolle.log` |
| `npm run check` innerhalb Sandbox | Exit 1; alle 54 Vitest-Dateien scheiterten vor Testausführung an EPERM beim Umbenennen temporärer SSR-Cachedateien. Kein Produktfehler daraus behauptet. Beleg: `QM/82-ms0-2026-10-08/check.log` |
| `npm run check` nach genehmigter Eskalation | Exit 0; 54 Dateien / 733 Tests, 110 Lint-Warnungen / 0 Fehler. Aktencheck: 65 aktive OPs, 20 Kriterienzeilen, keine verschwundenen Worte in geschützten Akten. Beleg: `QM/82-ms0-2026-10-08/check-escalated.log` |
| Gezielter ESLint nach letzter Belegprüferergänzung | Exit 0 für `scripts/belege/fertigstellung-basis.mjs` |
| `npm run build` | Exit 0; Einstieg 149755 B gzip, Rechenkern 103801 B gzip; Werkzeugtext-Gesamtpakete über Warnschwellen. Beleg: `QM/82-ms0-2026-10-08/build.log` |

Laufprotokolle und wegwerfbare Aufnahmeskripte liegen lokal im ignorierten `QM/` bzw. `tmp/`.
Der dauerhafte Belegprüfer und die Kriterienbasis liegen außerhalb dieser ignorierten Ordner.
Die externe Reservierung ist auch nach diesen Prüfungen nicht bestätigt.

Keine Browser-, Konto-, Rust-Neubau-, Vorleser- oder Geräteabnahme durchgeführt; diese liegen
außerhalb der lokalen MS0-Kriterienarbeit. Originalberichte wurden gelesen und ihre Texte
byteidentisch übernommen, ihre Produktmessungen nicht erneut ausgeführt.

## Offene Punkte und Risiken

- [ ] OP-066: tatsächliche Prüfer-/Geräte-/Zugangsbuchung; vollständiger MS0-Exit noch offen.
- [ ] OP-065: 26 Karten in MS1–MS7 bearbeiten; keine Reparatur in dieser Sitzung.
- [ ] Belegbasis und sonstige Änderungen sind noch nicht committed; neue Dateien sind versionierbar, noch nicht versioniert.

## Empfohlener nächster Schritt

Externe Koordination bestätigen und unabhängigen Prüfer/Zielgeräte zuordnen. MS1 kann als
nächster lokaler Auftrag begonnen werden; seine Lizenz-/Risikoentscheidungen bleiben gesondert
bei Thomas. Produktionspush und Deployment bleiben dem bestehenden autorisierten Weg vorbehalten.

## Git

- Bezugsrevision: `556159f58ac3beac3b6349851dae7326558b7fbb`.
- Commit: nichts committet, kein Push oder Deployment.
- Arbeitsbaum: bestehende Konzeptakte erhalten; neue MS0-Akten, Belegskript und datierte Nachträge uncommittet.
