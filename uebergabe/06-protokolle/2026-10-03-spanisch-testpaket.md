# Fortschrittsprotokoll: Spanisches Testpaket

**Datum:** 2026-10-03  
**Status:** lokal umgesetzt, nicht veröffentlicht, sprachliches Gegenlesen ausstehend

## Umfang

- Sprachkennung `es`, Selbstbezeichnung **Español**, Schreibrichtung `ltr`, Rückfall Englisch
- 94 gemeinsame Texte, 14 Suite-Texte und 618 werkzeugnahe Texte
- 21 Werkzeuge und alle 18 lokalen Werkzeugkataloge
- spanische Titel, Kurzbeschreibungen, Bedienoberflächen und Suchbegriffe
- Browsererkennung für Varianten wie `es-MX`

Der erste Übersetzungsstand wurde mit ausdrücklicher Zustimmung am 2026-10-03 über Google Translate
aus den öffentlichen englischen UI-Texten erzeugt und technisch nachbearbeitet. Es wurden keine
Nutzerdaten oder Nutzerdateien übertragen. Er ist ein lokaler Teststand und noch keine sprachlich
freigegebene Veröffentlichung.

## Technische Prüfung

- Schlüsselgleichheit zwischen Englisch und Spanisch: bestanden
- Unicode-Normalform NFC und Prüfung auf Ersatzzeichen: bestanden
- Katalog: 21 Werkzeuge, 3 Sprachen, 21 Symbole, 1.749 Suchbegriffe, 70 Dateitypen
- 152 Tests: bestanden
- Produktions-Build und Bundle-Prüfung: bestanden
- Startcode: 183.024 Byte gzip; keine optionale PDF-Engine statisch erreichbar

## Vor Veröffentlichung offen

- alle Texte durch einen Spanischsprecher auf Natürlichkeit und fachliche Bedeutung prüfen
- regionale Neutralität und einheitliche Terminologie kontrollieren
- sämtliche Werkzeuge auf Desktop und Mobil visuell durchgehen
- auffällige maschinelle Übersetzungen direkt in den jeweiligen `es.ts`-Dateien korrigieren

