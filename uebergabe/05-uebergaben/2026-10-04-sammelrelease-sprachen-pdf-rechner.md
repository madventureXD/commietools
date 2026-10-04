# Abschlussübergabe: Sammelrelease Sprachen, PDF und Rechnen

**Datum:** 2026-10-04  
**Bearbeitet durch:** Codex; Taschenrechner-Suite parallel durch Faber  
**Status:** abgeschlossen und auf `main` veröffentlicht; Online-Nachkontrolle offen

## Ziel

Den zusammenhängenden lokalen Entwicklungsstand als überprüften Sammelrelease veröffentlichen:
sprachgetrennte Suchpakete, spanisches Testpaket, PDF-Suite M0 bis M9, vollständige Suite
„Rechnen", mobile Korrekturen sowie aktualisierte Erweiterungs- und Übergabedokumentation.

## Ergebnis

- 41 lokale Werkzeuge in 6 Suiten und 3 Sprachen sind auf `main` veröffentlicht.
- Pro Sitzung werden nur das Such- und Werkzeugtextpaket der gewählten Sprache sowie Englisch
  geladen. Der komprimierte Startcode sank auf 136.961 Byte.
- Größenbudgets sind Warnschwellen; Architekturverstöße wie statisch erreichbare große Engines
  bleiben harte Fehler.
- PDF M8 und M9 ergänzen Metadaten, Beschneiden, Reparatur, Anhänge, Vergleich, PDF/A-Vorcheck
  und sichere Schwärzung. Bewusst nicht angeboten werden unzuverlässige PDF/A- und
  Office-Konvertierungen.
- Die Suite „Rechnen" umfasst neun Werkzeuge und ist vollständig umgesetzt.
- Alle 41 Werkzeugrouten wurden bei exakt 320 px Breite ohne unbeabsichtigtes Abschneiden
  geprüft.
- Lokale Arbeitsordner und Codex-Anhänge sind ausdrücklich vom Repository ausgeschlossen.

## Betroffene Bereiche

- `apps/web`: Oberfläche, Werkzeugrouten, Sprachpakete und responsive Korrekturen
- `packages/tools`: Manifeste, Katalog, Suchdaten und Werkzeuglogik
- `packages/pdf-core` und PDF-Engines: M0 bis M9
- `scripts`: Katalog-, Lizenz-, Bundle- und Viewport-Prüfungen
- `uebergabe`: Architektur, Konzepte, Regularien, Roadmap und Abschlussstand

## Verbindliche Entscheidungen

1. Neue Sprachen folgen dem Regularium in `02-architektur/sprachpakete.md` und werden als eigene
   Pakete erzeugt; Englisch bleibt Such-Fallback.
2. Generierte Katalog-, Lizenz- und Sprachdateien werden ausschließlich über die vorgesehenen
   Skripte aktualisiert.
3. Budgetüberschreitungen erzeugen Warnungen und blockieren nicht allein die Veröffentlichung.
4. Große Engines dürfen den Startpfad nicht statisch erreichen und werden nur bei Bedarf geladen.
5. `test-assets/pdf/m7/keystore.p12` ist ein dokumentiertes, selbstsigniertes und frei
   austauschbares Testzertifikat; es enthält keinen Produktivschlüssel.

## Prüfung des Release-Stands

| Prüfung | Ergebnis |
|---|---|
| Frische Installation | bestanden, 0 bekannte Schwachstellen |
| Lizenzprüfung | 522 Pakete, 16 Lizenztexte, 188 Originaldokumente |
| Katalogprüfung | 41 Werkzeuge, 3 Sprachen, 41 Symbole, 92 Dateityp-Deklarationen |
| Typprüfung und Lint | bestanden |
| Webtests | 301 Tests in 16 Dateien bestanden |
| Produktions-Build | bestanden |
| Bundle-Prüfung | 136.961 Byte Startcode; keine verbotene Engine im Startpfad |
| Viewport-Prüfung | alle 41 Routen bei 320 px bestanden |
| Sauberer Checkout | gesamter Prüflauf bestanden |
| Repository-Prüfung | keine Builds, Abhängigkeiten, lokalen Anhänge oder Umgebungsdateien verfolgt |

## Git und Veröffentlichung

- Release-Implementierung: `a47d725`
- Stabilisierung des sauberen Checkout-Prüflaufs: `870866c`
- Ausschluss lokaler Arbeitsdateien: `95e1b2f`
- Zielbranch: `main`
- Remote: `origin/main`
- Arbeitsbaum war vor dieser Dokumentationsübergabe sauber und synchron.
- Der Push auf `main` stößt die Cloudflare-Pages-Bereitstellung automatisch an.

## Bewusst offene Punkte

1. Produktivdeployment auf `commietools.org` prüfen und einen mobilen Rauchtest durchführen.
2. Das veröffentlichte spanische Testpaket sprachlich und visuell gegenlesen.
3. Vollständige Tastaturbedienung der Rechner- und Werkzeugflüsse automatisiert prüfen.
4. Sichtbaren Source-Link integrieren und Mail-DNS nachkontrollieren.
5. Den frei weitergebbaren PDF-Interoperabilitätskorpus weiter ausbauen.

Die vollständige, priorisierte Liste steht in `../01-stand/offene-punkte.md`.

## Empfohlener nächster Schritt

Nach Abschluss des Cloudflare-Deployments `commietools.org` auf Deutsch, Englisch und Spanisch
öffnen, Navigation und Sprachwechsel mobil prüfen und je ein Werkzeug aus PDF, Rechnen und Bilder
bis zum Ergebnis beziehungsweise Speichern durchspielen. Danach kann der veröffentlichte Stand
als online abgenommen markiert werden.
