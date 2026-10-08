# Lizenzentscheidungen vom 2026-10-08

Der Benutzer genehmigte in dieser Sitzung ausdrücklich:

- `zlib-rs 0.6.8`: ausschließlich `Zlib`, enge Ausnahme für die gespeicherte Registry-Prüfsumme.
- `unicode-ident 1.0.26`: ausschließlich `(MIT OR Apache-2.0) AND Unicode-3.0`, ebenfalls an die Registry-Prüfsumme gebunden.
- `cms 0.2.3` und `p12-keystore 0.1.5`: befristete Ausnahme für fehlende Originalhinweise bis einschließlich 2026-11-08. Die Lizenzangaben sind bereits von der Richtlinie gedeckt. Kein Originalhinweis wird behauptet.

Die Antworten lauteten „Ja, diese beiden gebundenen Ausnahmen freigeben“ und „Befristete Hinweis-Ausnahmen genehmigen“. Konkreter Umfang und Ablauf waren Bestandteil der Fragen.

Die Registry-Quellen stammen aus dem vorhandenen gesperrten Cargo-Lockstand. `licenses/rust-review.json` speichert Quelle, Prüfsumme, exakten Ausdruck, Entscheidungstyp, Datum und Beleg. Die allgemeine Richtlinie bleibt unverändert. Veränderte Lizenz/Quelle/Version und abgelaufene Hinweis-Ausnahmen sperren.

Für `asn1-rs-impl` und `defmt-parser` wurden Originaltexte aus den Paket-VCS-Commits übernommen; keine Ausnahme ist erforderlich. `alloc-stdlib` ist im aktuellen Zielgraphen nicht enthalten. Die bestehende `pdf_signer`-Lizenzentscheidung vom 2026-10-06 ist übernommen und zusätzlich an den vendorten Quellbestand gebunden.

Wiedervorlage: Originalhinweise für `cms` und `p12-keystore` bis 2026-11-08 beschaffen oder erneut ausdrücklich entscheiden. Ein grüner Lizenzlauf beseitigt diese Lieferauflage nicht.
