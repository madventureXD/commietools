# ADR 0011: Die Summe der Werkzeugtextpakete wird je Paket gemessen, nicht als feste Größe

**Status:** angenommen  
**Datum:** 2026-10-05

## Kontext

Mit der Aufteilung der Werkzeugtexte **je Werkzeug und je Sprache** (ADR 0010) trägt jede erzeugte
Paketdatei einen eigenen gzip-Kopf und ein eigenes Wörterbuch. Die Bündelprüfung
(`scripts/bundle-audit.mjs`) führt seitdem zwei Kennzahlen:

1. die Last **je Route** (gemeinsames Paket + größtes Werkzeugpaket) gegen 30.720 B,
2. die **Summe** aller Pakete je Sprache gegen 40.960 B.

Mit dem vierten Werkzeug der Welle B (Bodenbelag) reißt die zweite Kennzahl:

| Sprache | Pakete | Summe | je Paket | alte Schwelle | Last je Route |
|---|---:|---:|---:|---:|---:|
| Deutsch | 53 | 41.309 B | 779 B | 40.960 B überschritten | 5.199 B von 30.720 |
| Englisch | 53 | 37.278 B | 703 B | eingehalten | 4.685 B von 30.720 |
| Spanisch | 53 | 40.626 B | 766 B | eingehalten | 5.207 B von 30.720 |

**Die Last eines Besuchs ist unverändert**: Eine Werkzeugroute lädt das gemeinsame Paket und die
Texte **eines** Werkzeugs — 5.199 B von 30.720 B Warnschwelle, unverändert seit dem Umbau. Die
Summe ist keine Besucherlast, sondern eine Kontrolle gegen ausufernde Einzelpakete.

## Entscheidung

Die Summe wird **je Paket** gemessen: Schwelle `850 B × Anzahl der Pakete` (bei 53 Paketen
45.050 B). Der Wert liegt rund 9 % über dem größten gemessenen Paketdurchschnitt (779 B) und
schlägt an, wenn ein einzelnes Werkzeug oder das gemeinsame Paket deutlich ausufert — genau das,
was diese Kennzahl leisten soll. Eine feste Obergrenze wird dagegen mit jedem neuen Werkzeug enger,
ohne dass irgendetwas größer wird; sie bestraft die Aufteilung, die ADR 0010 bewusst gewählt hat.

## Folgen

- Die Aussage der Prüfung ist jetzt skalierbar und bleibt scharf: 850 B je Paket statt einer Zahl,
  die mit der Werkzeugzahl wandert.
- Ein Werkzeug mit ungewöhnlich vielen Texten fällt weiterhin auf — dann steigt der Durchschnitt,
  nicht nur die Summe.
- Die entscheidende Kennzahl bleibt die **Last je Route**; sie ist unverändert eingehalten und
  wird weiterhin gegen eine feste Schwelle gemessen.
- Wird die Textmenge je Werkzeug insgesamt größer, ist die Antwort weiterhin die Aufteilung
  (etwa gemeinsame Texte ausdünnen), nicht das Anheben dieser Schwelle.
