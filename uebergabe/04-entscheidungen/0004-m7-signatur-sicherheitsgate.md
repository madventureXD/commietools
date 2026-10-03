# ADR 0004: M7 bleibt bis zu einer sicher prüfbaren Browser-Engine gesperrt

**Status:** angenommen  
**Datum:** 2026-10-03

## Kontext

M7 soll Zertifikatssignaturen aus PKCS#12/PFX lokal in PDF-Dateien einbetten und vorhandene PDF-Signaturen prüfen. Fehler in diesem Bereich können ungültige Dokumente als gültig darstellen, private Schlüssel gefährden oder irreführende Vertrauensaussagen erzeugen. Eine sichtbare Unterschrift ist kein Ersatz.

Der vorhandene MuPDF-1.28.1-Browserwrapper exportiert die Signaturfunktionen der nativen Engine nicht. Der geprüfte `@signpdf`-Stack 3.3.0 unterstützt P12-Signaturen, ist primär auf Node.js ausgerichtet und verwendet `node-forge`. Das npm-Audit meldet dafür `GHSA-86w9-cpqp-85rv` mit hoher Schwere: RSA-PKCS#1-v1.5-Signaturprüfung kann zusätzliche verschachtelte Digest-Algorithmus-Elemente akzeptieren. Ein Fix ist nicht verfügbar. Die testweise installierten Pakete wurden unmittelbar wieder entfernt.

PKI.js ist grundsätzlich browserfähig und verwendet WebCrypto. Die aktuelle Upstream-Lage enthält jedoch offene sicherheitsrelevante Fragen unter anderem zu ASN.1-Rekursion, Algorithmusparametern und unvollständiger Zertifikatsgültigkeitsprüfung. Neue oder eng spezialisierte Projekte besitzen noch keine ausreichende Reife und Interoperabilitätsbasis für eine allgemeine CommieTools-Freigabe.

## Entscheidung

M7 wird nicht mit einer ungepatchten oder unzureichend geprüften Signaturbibliothek umgesetzt. Es erscheinen vorerst weder ein Werkzeug zum Signieren noch eines, das eine kryptografische Gültigkeits- oder Vertrauensaussage verspricht.

Eine spätere Engine muss vor der Integration alle folgenden Gates erfüllen:

1. Browserbetrieb ohne Serverübertragung von PDF, Zertifikat, Passwort oder privatem Schlüssel.
2. Gepflegte Open-Source-Lizenz, reproduzierbarer Build und vollständiges Artefaktregister.
3. Keine bekannte ungepatchte Schwachstelle hoher oder kritischer Schwere im verwendeten Signaturpfad.
4. P12/PFX-Import mit klar dokumentierter Algorithmus- und Zertifikatsunterstützung.
5. Inkrementelle PDF-Signatur mit korrektem `ByteRange` und CMS/PKCS#7 beziehungsweise PAdES-B-B.
6. Getrennte Ergebnisse für mathematische Integrität, Änderungen nach Signatur, Zertifikatszeitraum, Vertrauenskette, Widerruf und Zeitstempel.
7. Ohne aktuelle Vertrauens- und Sperrlisten niemals die Aussage „vertrauenswürdig“.
8. Testkorpus mit gültigen, manipulierten, abgelaufenen, mehrfach signierten und unbekannt vertrauenswürdigen Dokumenten.
9. Gegenprüfung mit mindestens Adobe Acrobat, einem zweiten unabhängigen Reader und einem unabhängigen kryptografischen Prüfer.
10. Unabhängige Sicherheitsreview vor öffentlicher Freigabe.

## Folgen

- M7 bleibt am Sicherheitsgate offen; M8 darf unabhängig davon beginnen.
- Die vorhandene sichtbare Unterschrift bleibt klar als nicht kryptografisch gekennzeichnet.
- Eine reine Strukturerkennung von `/Sig` oder `/ByteRange` darf nicht als Signaturprüfung bezeichnet werden.
- Zeitstempel-, OCSP- oder CRL-Netzwerkzugriffe wären später einzeln zustimmungspflichtige Online-Funktionen.
