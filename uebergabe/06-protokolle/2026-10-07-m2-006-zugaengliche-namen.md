# M2-006 — Zugängliche Namen blieben sprachunabhängig englisch

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2) · **Karte:** M2-006 (R5)
**Ergebnis:** behoben — beide Namen kommen jetzt aus i18n-Schlüsseln, die Modusgruppe ist eine echte Gruppe.

## Was die Karte verlangt

- Name der Hauptnavigation und Bezeichnung der Modusgruppe als **stabile common-Schlüssel** führen.
- Case-Modus als **semantische Gruppe** beschriften (`fieldset`/`legend` oder begründet
  `role="group"`); ein `aria-label` an einem generischen `div` ist **kein** sicherer
  Gruppierungsvertrag.
- Namen müssen sich beim Sprachwechsel so aktualisieren wie sichtbare Texte.
- Die gemeinsame Kontrolle **sichtbarer JSX-Literale und ARIA-Attribute** in den
  Werkzeug-Erstellungsregeln festhalten.
- Abnahme: de/en/es — Name der Navigation und der Modusgruppe im **Accessibility-Baum** korrekt;
  echte Vorleseransage, Tastaturbedienung und aktive Moduskennzeichnung prüfen.
- **Nicht tun:** mathematische Symbole oder Eigennamen per blindem Suchen-Ersetzen übersetzen;
  kein zusätzlicher versteckter Text ohne Nutzen.

## Bestandsaufnahme (gemessen)

Ein Durchlauf über alle `.tsx`-Dateien nach festen Zeichenketten in zugänglichen Attributen fand
**genau zwei** Stellen:

| Stelle | vorher | Verantwortung |
|---|---|---|
| `App.tsx` Hauptnavigation | `aria-label="Main navigation"` — englisch in allen drei Sprachen | Oberflächentext → Schlüssel |
| `App.tsx` Modusgruppe des Groß-/Kleinschreibungs-Werkzeugs | `aria-label="Case mode"` an einem `div.segmented` **ohne Rolle** | Oberflächentext + fehlender Gruppenvertrag |

Die übrigen Funde sind **keine** Oberflächentexte und bleiben Literale: Datums-/Zeitbeispiele
(`2026-10-03`, `2026-10-06 09:30`) und der Termausdruck `x^2 - 4`. Genau diese Ausnahme nennt die
Karte („keine mathematischen Symbole per blindem Ersetzen").

Die Modusknöpfe trugen ihre aktive Kennzeichnung nur als CSS-Klasse (`className="active"`) — im
Accessibility-Baum war **kein** Knopf als gedrückt erkennbar.

## Umsetzung

1. **Neue Schlüssel in allen drei common-Dateien** (`packages/i18n/src/common/{de,en,es}.ts`):
   - `nav.main` — *Hauptnavigation* / *Main navigation* / *Navegación principal*
   - `caseConverter.mode` — *Schreibweise* / *Case mode* / *Mayúsculas y minúsculas*
2. **`App.tsx`:** `<nav aria-label={t('nav.main')}>`; die Modusgruppe ist jetzt
   `role="group"` mit übersetztem Namen, und jeder Knopf trägt `aria-pressed={mode === item}`.
3. **Erstellungsregeln festgeschrieben** in `docs/ui-system.md` (neuer Abschnitt „Accessible names
   are interface text, not source text") **und** im Skill `commietools-werkzeug-bauen`: sichtbare
   Literale und ARIA-Attribute werden **zusammen** geprüft — der halbe Fall (Label übersetzt,
   Attribut englisch) ist der Normalfall dieses Fehlers.

## Belege (`work/m2-006-namen-beleg.cjs`, Messwerte in `work/m2-006-messwerte.json`)

Gelesen wurde der **Accessibility-Baum** über `Accessibility.getFullAXTree` (das, was eine
Vorleserin bekommt), je Sprache nach einem echten Sprachwechsel über die Sprachauswahl:

| Sprache | Name der Navigation im Baum | Gruppenname im Baum | aktive Kennzeichnung | Tastatur (echte Enter-Taste) |
|---|---|---|---|---|
| de | **Hauptnavigation** | **Schreibweise** | `true,false,false` | `true,false,false` → **`false,true,false`** |
| en | **Main navigation** | **Case mode** | `true,false,false` | `true,false,false` → **`false,true,false`** |
| es | **Navegación principal** | **Mayúsculas y minúsculas** | `true,false,false` | `true,false,false` → **`false,true,false`** |

Die drei Navigationsnamen sind nachweislich **verschieden** — der Name hängt also an der Sprache und
nicht am Quelltext. Die Tastaturprüfung erfolgte mit echten Tastenereignissen
(`Input.dispatchKeyEvent`, Enter) auf dem fokussierten zweiten Modusknopf: Der Modus wechselt, der
Fokus bleibt auf dem gedrückten Knopf.

**Kette:** `npm run check` Exit 0 (695 Tests, 48 Dateien — die Schlüsselparität der drei Sprachen
ist Teil der Testreihe) · `npm run build` Exit 0 (Startbündel 149492 B gzip).

## Benannte Grenzen

- **Keine echte Vorleseransage.** NVDA/Narrator ist in dieser Umgebung nicht herstellbar. Belegt ist
  der Accessibility-Baum plus echte Tastaturereignisse; die gesprochene Ansage selbst bleibt
  Handarbeit und wird **nicht** als erfüllt behauptet. Die Karte verlangt sie zusätzlich — das ist
  die eine offene Restforderung dieser Karte.
- **Nicht geprüft:** Ansageverhalten bei Sprachwechsel **während** eine Vorleserin läuft (setzt eine
  laufende Vorleserin voraus).

## Prüfmittel-Lehren (eigene Fehler)

1. **Der Accessibility-Baum liefert `"true"` als Zeichenkette.** Mein Urteil verglich mit dem
   Wahrheitswert `true` und meldete „kein Knopf als gedrückt gekennzeichnet" — obwohl alle drei
   Sprachen sauber waren. Ein Prüfer, der die richtige Sache falsch vergleicht, sieht wie ein
   Produktfehler aus.
2. **Feste Namenslisten je Sprache im Prüfer sind selbst eine Fehlerquelle.** Die spanischen
   Knopfnamen fehlten in meiner Erwartungsliste, wodurch die spanische Zeile „nicht gefunden"
   meldete. Die Knöpfe werden jetzt aus dem Dokument gelesen und nur die *Gruppe* gegen den
   erwarteten Namen geprüft.
