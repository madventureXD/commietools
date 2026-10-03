# ADR 0001: Open Source vor Eigenentwicklung

**Status:** angenommen  
**Datum:** 2026-10-03

## Kontext

CommieTools soll hochwertige Werkzeuge lokal und offline bereitstellen und zugleich nachvollziehbar, modular und lizenzkonform bleiben. Viele benötigte Dateiformate und Verarbeitungsaufgaben besitzen bereits ausgereifte Open-Source-Implementierungen. Eine parallele Eigenentwicklung würde Wartungs-, Sicherheits- und Kompatibilitätsrisiken erhöhen und dem Kernzweck des Projekts widersprechen.

## Entscheidung

Neue Verarbeitungsfähigkeiten werden vorrangig durch geeignete Open-Source-Lösungen bereitgestellt. Vor einer Eigenentwicklung müssen Kandidaten recherchiert, anhand festgelegter Muss-Kriterien verglichen und, wenn sinnvoll, mit realen Dateien prototypisch geprüft werden.

Eine Lösung ist adäquat, wenn sie mindestens die benötigte Funktion sowie die Anforderungen an Zielplattform, Local-/Offline-First, Sicherheit, Datenschutz, Barrierefreiheit, Wartungszustand, Leistung, Dateikompatibilität und Lizenz erfüllt. Sie muss vollständig in die Lizenzdatenbank aufgenommen werden können.

Eigenentwicklung ist nur zulässig, wenn keine adäquate Lösung existiert oder alle Kandidaten an einem dokumentierten Muss-Kriterium scheitern. Die Begründung wird im Konzept, in der Übergabe oder in einem ergänzenden ADR festgehalten.

Projektbezogene Adapter, Benutzeroberflächen, Validierung, Ablaufsteuerung, Formatgrenzen und Tests werden weiterhin selbst erstellt. Sie sollen eine Open-Source-Engine sauber in CommieTools integrieren, nicht deren Kernfunktion unnötig nachbauen.

## Folgen

- Konzepte enthalten künftig eine Open-Source-Kandidatenprüfung vor der Implementierungsentscheidung.
- Lizenz- und Sicherheitsprüfung erfolgen vor Aufnahme einer Abhängigkeit.
- Große Engines werden nur für ihre Werkzeuge nachgeladen und nach den Offline-Regeln verwaltet.
- Eigenentwickelte Kernalgorithmen benötigen eine kurze dokumentierte Begründung.
- Vorhandene Implementierungen werden nicht automatisch ersetzt; sie werden bei der nächsten wesentlichen Erweiterung gegen diese Entscheidung geprüft.

## Anwendung auf die PDF-Suite

- M0 bis M3 verwenden PDF.js und `pdf-lib`; eigene Logik beschränkt sich auf CommieTools-spezifische Bedienung, Platzierung, Validierung und Orchestrierung.
- M4 verwendet MuPDF.js für echte Formulare und Annotationen.
- M5 beginnt mit einem Open-Source-Vergleich für Schutz, Entsperren und Kompression. Eine Eigenengine ist nur nach dokumentierter Ablehnung geeigneter Kandidaten zulässig.
