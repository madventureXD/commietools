# Sitzungsübergaben

Für jede relevante Arbeitssitzung wird eine Datei aus der Übergabevorlage angelegt:

```text
YYYY-MM-DD-kurzer-titel.md
```

Eine Übergabe beantwortet knapp:

- Was war das Ziel?
- Was wurde tatsächlich geändert?
- Welche Dateien und Commits sind relevant?
- Welche Prüfungen wurden ausgeführt?
- Was ist offen, riskant oder blockiert?
- Was ist der sinnvollste nächste Schritt?

Übergaben sind chronologische Momentaufnahmen. Dauerhafte Regeln gehören in die Fach- oder Architekturdokumentation, Aufgaben in `01-stand/offene-punkte.md` und verbindliche Entscheidungen in einen ADR.

## Nachtrag 2026-10-07 (Faber): elf ältere Übergaben erfüllen die Vorlage nicht

Bei der Prüfung der neuen Übergabe (`2026-10-07-r5-sechs-karten-abgeschlossen.md`) gegen
`uebergabe/vorlagen/uebergabe.md` wurden die **bestehenden** Übergaben mitgeprüft. Elf von ihnen
tragen die Pflichtabschnitte nicht vollständig:

- `2026-10-03-cloudflare-pages.md` — es fehlen: Ziel der Sitzung, Geänderte Bereiche, Entscheidungen, Prüfungen, Offene Punkte, nächster Schritt, Git
- `2026-10-03-datensparsame-ladegrenzen.md` — es fehlen: Ziel der Sitzung, Ergebnis, Geänderte Bereiche, Entscheidungen, Offene Punkte, nächster Schritt
- `2026-10-03-faber-cloudflare-dns.md` — es fehlen: Entscheidungen
- `2026-10-03-pdf-m0-m1.md` — es fehlen: Ziel der Sitzung, Geänderte Bereiche, Entscheidungen, Prüfungen, Offene Punkte, nächster Schritt, Git
- `2026-10-03-pdf-m2.md` — es fehlen: Ziel der Sitzung, Geänderte Bereiche, Entscheidungen, Prüfungen, Offene Punkte, nächster Schritt, Git
- `2026-10-03-pdf-m3.md` — es fehlen: Ziel der Sitzung, Geänderte Bereiche, Prüfungen, Offene Punkte, nächster Schritt, Git
- `2026-10-03-pdf-m4.md` — es fehlen: Ziel der Sitzung, Geänderte Bereiche, Entscheidungen, Prüfungen, Offene Punkte, Git
- `2026-10-03-pdf-m5.md` — es fehlen: Ziel der Sitzung, Geänderte Bereiche, Entscheidungen, Prüfungen, Offene Punkte, Git
- `2026-10-03-pdf-m6.md` — es fehlen: Ziel der Sitzung, Ergebnis, Geänderte Bereiche, Entscheidungen, Prüfungen, Offene Punkte, nächster Schritt, Git
- `2026-10-04-rechner-tastenfeld-umgesetzt.md` — es fehlen: Ziel der Sitzung, Ergebnis, Geänderte Bereiche, Entscheidungen, nächster Schritt, Git
- `2026-10-04-sammelrelease-sprachen-pdf-rechner.md` — es fehlen: Ziel der Sitzung, Geänderte Bereiche, Prüfungen

**Nicht ergänzt, sondern festgehalten.** Die fehlenden Abschnitte ließen sich nur aus dem
Sitzungsprotokoll rekonstruieren; sie jetzt aus dem Zusammenhang zu erfinden wäre schlechter als
die benannte Lücke. Wer eine dieser Übergaben braucht, findet den vollen Verlauf in
`C:\hermes-team2\state.db` (Sitzungen nach Datum) — und ergänzt die Datei dann mit datiertem
Nachtrag, ohne den alten Wortlaut zu überschreiben.
