# Übergabe: CommieTools QM-Sanierung — Stufe R10 abgeschlossen (Weg A)

**Datum:** 2026-10-07  
**Bearbeitet durch:** Faber (Hermes Agent) auf Anweisung von Thomas  
**Auftrag:** „Go" auf Stufe R10 (Karte `M8-005` aus `QM/70-reparaturempfehlungen/R10.md`) — die
Vorlage zur Betreiberentscheidung, dann deren Umsetzung auf Entscheidung „A". Ausdrücklich **nicht**
beauftragt: eine Kontoänderung bei Cloudflare (im Bericht der Karte untersagt), der Push und jede
Veröffentlichung.  
**Status:** abgeschlossen

## Ziel der Sitzung

Die Karte M8-005 ist eine **Empfehlung, keine Umsetzung**: sie verlangt, die Betreiberentscheidung
vorzubereiten (NEL behalten und dokumentieren **oder** über die Cloudflare-Zoneneinstellung
abschalten) und den Datenfluss danach transparent zu dokumentieren.

## Ergebnis

**Der Kartenbefund ist geschlossen.** Die Entscheidung ist gefallen (Weg A: behalten und
dokumentieren), und die Dokumentation trägt den gemessenen Sachverhalt:

- `docs/architecture.md` → neuer Unterabschnitt „Infrastructure error reports (Network Error
  Logging)" mit den gemessenen Kopfzeilen und der ausdrücklichen Trennung
  **Dokumentverarbeitung / Ressourcenabrufe / Infrastrukturberichte**.
- `docs/deployment-cloudflare-pages.md` → neuer Abschnitt mit Messwerten, Nachprüf-Befehl
  (`curl -sS -D - -o /dev/null https://commietools.org/ | grep -i '^nel\|^report-to'`) und dem
  Hinweis, dass `max_age` sieben Tage gilt (eine Änderung ist nie sofort wirksam).

**Gemessen (2026-10-07 18:34:54 UTC, ausgelieferter Stand):**
`Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}` und `Report-To` mit Gruppe
`cf-nel`, Endpunkt `https://a.nel.cloudflare.com/report/v4?s=…`. Die Kopfzeile setzt der **Anbieter**
(`Server: cloudflare`) — sie steht **nicht** in `apps/web/public/_headers` und wird von der Anwendung
nicht gesetzt. Es werden **nur Fehlschläge** berichtet.

## Geänderte Bereiche

- `docs/architecture.md` – Unterabschnitt zu Infrastrukturberichten und Datenflüssen (ergänzt)
- `docs/deployment-cloudflare-pages.md` – Abschnitt zu NEL mit Nachprüfung und `max_age` (ergänzt)
- Akte: `06-protokolle/2026-10-07-r10-oeffentliche-header.txt` (Rohmessung),
  `06-protokolle/2026-10-07-r10-m8-005-entscheidungsvorlage.md` (Vorlage + Abschnitt 6
  „Entscheidung und Umsetzung"), Kartenstand in `00-einstieg/vorgehen-qm-audit.md`

## Entscheidungen und Annahmen

- **Weg A (Thomas):** die Richtlinie bleibt aktiv, weil die Anwendung selbst nichts sendet und nur
  Fehlschläge berichtet werden. Der Befund der Karte war eine **Dokumentationslücke**, kein
  beobachteter Abfluss der Anwendung.
- **Keine Kontoaktion** — die Karte untersagt sie ausdrücklich; eine Abschaltung wäre Thomas' Schritt.
- **Keine harmlose Fehlerprobe gegen den Betrieb** (die Abnahme erlaubt sie nur auf eigener
  Testumgebung). Ein **Versandnachweis liegt deshalb nicht vor**; gemessen ist die Richtlinie selbst.
- **Messung betrifft den veröffentlichten Stand** (`origin/main`), nicht den Arbeitsbaum
  (145 Commits weiter). Für diese Entscheidung ist der Betrieb maßgeblich.
- Nebenfund, nicht behoben: die lebende CSP ist enger (`script-src 'self'`) als
  `apps/web/public/_headers` — erklärt sich aus dem veröffentlichten Stand, kein Widerspruch in der Datei.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | Exit 0 · 54 Dateien, 733 Tests, 0 Lint-Fehler, 110 Hinweise |
| `npm run build` | Exit 0 · Eingang 149 755 B gzip |
| `npm run akte:check` | Exit 0 · vier Regelkreise grün |
| Messung der öffentlichen Kopfzeilen | 2 Abrufe (`/`, `/sw.js`), beide mit `Nel`/`Report-To` |

## Offene Punkte und Risiken

- [ ] **Nicht belegt:** ein tatsächlicher Berichtsversand (bewusst nicht provoziert).
- [ ] **OP-045** — zweiter Teil offen (Adressmuster nach `await` in fünf Werkzeugen).
- [ ] **OP-062/OP-063** (aus R8) — Strukturmigration billigen?, weitere Belegskripte portieren?
- [ ] **OP-018/OP-034** — 132 Aktenlücken in historischen Übergaben (gemeldet, nicht gewertet).
- [ ] **Der Push** — erst nach der unabhängigen Abschlusskontrolle.
- Risiko: bleibt die Richtlinie aktiv und ändert der Anbieter sie, ist die Dokumentation nach
  dieser Änderung zu prüfen (der Nachprüf-Befehl steht in `deployment-cloudflare-pages.md`).

## Empfohlener nächster Schritt

1. **Unabhängige Abschlusskontrolle** über alle Stufen R1–R10 (der Kopf ist baubar, OP-064 ist
   geschlossen) — danach die Entscheidung über den Push.
2. Offene Kleinfälle nach Wunsch: zweiter Teil von OP-045, OP-062/OP-063.

## Git

- Commit (Dokumentation, gemessen): **`ed45025`** — `docs/architecture.md`,
  `docs/deployment-cloudflare-pages.md`
- Commit (Akte): der auf die Dokumentation folgende Akten-Commit (Kartenstand, Vorlage, diese
  Übergabe) — er trägt **keine** Codeänderung
- Commit der Vorlage (Messwerte + Entscheidungsvorlage): `b7ad646`
- Arbeitsbaum: nur die zwei bewusst ungetrackten `test-assets/m4-005-*.pdf`
- **Nichts gepusht.**
