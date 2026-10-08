# MS0: Prüfzugang, Zuständigkeiten und Abnahmefenster

**Datum:** 2026-10-08  
**Status:** fachlich geplant; externe Buchungen und Personenbestätigungen offen  
**Beauftragung:** Thomas, „Ms0 go“; Codex führt MS0 aus.

Die Abnahmezeitpunkte sind relativ zu den Milestones, damit kein unbelegter Kalendertermin
zugesagt wird. Thomas koordiniert die Betreiber-/externen Entscheidungen gemäß bestehender
Projektrolle. Der Autor der Nachprüfung ist ein Kandidat für die unabhängige Prüfung, noch
nicht durch MS0 beauftragt. Faber ist in den historischen Akten Entwickler; aus diesem Auftrag
folgt keine neue Beauftragung Fabers für MS1–MS7. Die Entwicklung dieser Stufen wird beim Start
zugeordnet. Codex verantwortet die vorliegende MS0-Basis.

| Gruppe (Register-ID) | Zuständige Rolle / Koordination | Vorgesehenes Abnahmefenster | Benötigter Zugang / Umgebung | Bestätigung |
|---|---|---|---|---|
| `gegenpruefung` | unabhängiger Prüfer; Thomas benennt, Autor der Nachprüfung vorgeschlagen | nach jedem Reparaturmilestone; Gesamtabschluss MS7 | lokale Revision und Belegpaket, synthetische Fixtures | Person/Verfügbarkeit offen |
| `rust-lieferung` | unabhängiger Bau-/Sicherheitsprüfer; Thomas koordiniert | Ende MS1; neue Binary erneut in MS5 | zweite saubere Buildumgebung, passende Rust-/wasm-bindgen-Versionen, beide Locks | Umgebung/Person offen |
| `betreiberentscheidungen` | Thomas / Betreiber | vor Abschluss MS1; OP-062 vor Ende MS6 | sieben Lizenzentscheidungen, Risikobewertung und historische Akten | Inhalte noch nicht entschieden |
| `releasekonto` | Thomas / Betreiber, Entwicklung liefert konkrete Konfiguration | Ende MS5, vor MS7 | GitHub-Checks/Regeln, Cloudflare-Einstellungen, isolierter freigegebener CI-Weg | Kontoabnahme noch nicht durchgeführt |
| `reader-interop` | unabhängiger PDF-Prüfer; Thomas koordiniert | Ende MS5, im integrierten Stand MS6 | Acrobat, zweiter Reader, unabhängiger lokaler kryptografischer Prüfer, synthetische P12/PDFs | Person/Readerzugang offen |
| `zielgeraete` | Geräte-/Vorleserprüfer; Thomas benennt | MS6 nach integrierter Reparatur | Windows mit NVDA/Narrator und echtem Picker; Touchgerät mit nativem Browser; realer 200/400-%-Zoom; Auskoppelfenster | Person/Geräte offen |
| `frischer-checkout` | unabhängiger Prüfer bzw. zweite Umgebung; Thomas koordiniert | MS6 | sauberer Checkout ohne `QM/` und `work/`, dokumentierte Voraussetzungen | zweite Umgebung offen |
| `fachabnahme` | Elektro-/SHK-Fachkraft; Thomas benennt | MS6 vor A2 | `cable` und `heatload`, ursprünglicher Vorplanungs-/Überschlagsumfang, nachgerechnete Fälle und Quellen | Fachpersonen offen |
| `a2` | unabhängiger Prüfer von Thomas beauftragt | MS7 nach sämtlichen Reparatur- und Restabnahmen | eingefrorene Revision, Artefakthashes, Gesamtauftrag, alle Kartenbelege | Beauftragung/Termin offen |
| `auslieferung` | Thomas / Betreiber; unabhängiger Prüfer wertet Belege aus | geschützte autorisierte Preview vor A2; öffentlich nach Freigabe in MS7 | echte CSP/Cache-/NEL-Header, frisches und altes Profil, synthetischer Fehlerfall | externe Prüfung/Deployment offen |

**Keine Buchung behauptet:** Die Frage zur Koordination/Prüferwahl wurde Thomas in dieser Sitzung
gestellt. Solange keine Antwort vorliegt, ist diese Tabelle der vorgeschlagene Plan. Jede Person,
Geräteverfügbarkeit und feste Terminbestätigung wird als datierter Nachtrag eingetragen.
Die lokale Kriterienarbeit läuft davon unabhängig weiter.

Für die UI-Abnahme sind de/en/es, beide Themes, alle aktuellen Werkzeuggrundzustände,
geöffnete Kategorien/Menüs sowie die relevanten Lade-, Fehler- und Ergebniszustände vorgesehen.
Echte Reader, Zoom, Vorleser und Picker werden nicht durch Mocks ersetzt. Insbesondere bleiben
die komplexe PDF-Lesereihenfolge und die Touch-/Zoom-Koordinatenabnahme eigene Kriterien.

Die bestehende Regel aus ADR 0014 bleibt: unabhängige Kontrolle vor Produktionspush,
Push nur mit Thomas' Bestätigung. „Ms0 go“ autorisiert keinen frühen CI-Push, kein Hosting,
keine Nachricht an Prüfer und keine Kontokonfiguration. Der vorgeschlagene Releaseweg aus dem
Konzept wird in MS5 erst als konkrete Betreiberentscheidung behandelt.
