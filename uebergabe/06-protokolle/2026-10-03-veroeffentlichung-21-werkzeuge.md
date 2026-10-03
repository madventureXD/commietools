# Veröffentlichung: geprüfter Stand mit 21 Werkzeugen

**Datum:** 2026-10-03  
**Status:** über `main` zur Veröffentlichung freigegeben

## Umfang

Der manifestbasierte Katalog umfasst 21 vollständig lokale Werkzeuge in fünf Suiten. Enthalten
sind Text- und Entwicklerwerkzeuge, der QR-Code-Generator, fünf Bildwerkzeuge und zwölf
PDF-Werkzeuge bis einschließlich PDF-Suite M5.

Die Veröffentlichung erfolgt über das öffentliche GitHub-Repository `madventureXD/commietools`.
Ein Push auf `main` löst den bestehenden automatischen Cloudflare-Pages-Build für
`commietools.org` und `www.commietools.org` aus.

## Prüfstand vor der Freigabe

- Lizenzprüfung bestanden: 498 Pakete, 15 vollständige Lizenztexte und 171 bewahrte
  Paketdokumente
- Katalogprüfung bestanden: 21 Werkzeuge, 2 Sprachen, 21 Symbole und 70 deklarierte Dateitypen
- TypeScript-Prüfung bestanden
- 145 automatisierte Tests bestanden
- Produktions-Build bestanden
- Bundle-Prüfung bestanden: Startcode 163.994 Byte gzip; optionale PDF-Artefakte nicht statisch
  vom Einstieg erreichbar
- Git-Arbeitsbaum vor der Dokumentationsaktualisierung sauber

## Dokumentationspflege

Die veraltete Angabe von 14 Werkzeugen in der Haupt-README wurde auf 21 korrigiert und der dort
beschriebene Funktionsumfang der PDF-Suite auf den Stand M5 gebracht.

## Verbleibende Nachkontrolle

Nach Abschluss des Cloudflare-Builds sind die Produktivdomain, die PWA und mindestens je ein
Bild- und PDF-Werkzeug im Browser zu prüfen. Die getrennte Kontrolle der übernommenen
Mail-DNS-Einträge bleibt weiterhin offen.
