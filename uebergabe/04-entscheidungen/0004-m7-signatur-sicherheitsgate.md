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

## Alternative Prüfstrecke

Die Sperre gilt nicht für einen isolierten Forschungsprototyp. Als bevorzugte neue Prüfstrecke wird `StrategicProjects/pdf_signer` zunächst nativ reproduziert und unabhängig gegengeprüft. Erst danach darf ein minimaler Rust-WASM-Adapter für PAdES B-B untersucht werden. Der vollständige Prüfauftrag liegt unter `uebergabe/07-pruefung/m7/`. Bis alle dortigen Gates erfüllt sind, bleibt jeder Build intern und unveröffentlicht.

*Nachtrag 2026-10-07 (Faber, Karte M2-001).* Der vorstehende Text beschreibt den Stand vom
**2026-10-03** und bleibt unverändert erhalten. Seitdem ist M7 gebaut: drei signaturbezogene
Werkzeuge stehen im Katalog und werden ausgeliefert. Der tatsächliche Produktstand und der
Nachweisstand je Gate stehen in
[`0014-m7-freigabekriterien.md`](0014-m7-freigabekriterien.md) — Status **vorgeschlagen**, die
Annahme ist eine Betreiberentscheidung. Dieser nachgetragene Hinweis ersetzt nichts und nimmt keine
Freigabe vorweg.

*Zusatz 2026-10-07 (nach der Entscheidung).* Die Betreiberentscheidung ist gefallen: **ADR 0014 ist
angenommen** — mit den **Auflagen A1–A4** (Schwachstellenstand des Signaturpfads, unabhängige
Sicherheitsreview, GPL-Originalhinweis, revisionsgebundener Korpusbericht). Die Sperre dieses ADR gilt
damit für die drei gebauten Werkzeuge als durch die dort benannten Kriterien ersetzt; der **Push ist
darin nicht enthalten**.
