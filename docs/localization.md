# Localization

CommieTools uses a registry-driven hybrid translation model.

## Adding a language

Adding a language is intentionally limited to four steps:

1. Register it in `packages/i18n/src/registry.ts`, including its native label, writing direction, fallback and imports.
2. Add `packages/i18n/src/common/<locale>.ts`.
3. Add `packages/i18n/src/suites/<locale>.ts`.
4. Optionally add tool translations below each tool's `locales` directory and register them in that tool's local locale index.

The web application must not be changed. Its language selector, browser-language matching, persisted preference, HTML `lang` attribute and `ltr`/`rtl` direction are all derived from the registry.

## Ownership

- `packages/i18n/src/common`: navigation, actions, categories, status labels and generic tool UI.
- `packages/i18n/src/suites`: curated suite names and descriptions.
- `packages/tools/src/<category>/<tool>/locales`: wording owned by one tool.

Tools and manifests contain translation keys instead of display strings. The application combines the platform catalog with partial tool catalogs through `createTranslator`.

## Searchable text per tool

Every tool carries two mandatory keys in **every** locale file:

- `tool.<x>.summary` — one line for cards and search results, at most 120 characters, shorter than the description.
- `tool.<x>.terms` — comma-separated search terms. A leading `#` marks a tag, which is shown as a label on the tool card.

Rules the catalogue check enforces: both keys exist in every language, terms are neither empty nor repeated (case-insensitively), and at least one tag exists. `npm run catalog:generate` writes the searchable text of all languages into the generated register; `npm run check` fails when that register is out of date.

Two conventions make the German terms work in practice:

- **Folding runs one way only.** Matching resolves umlauts, accents and the sharp s (`Größe` → `grosse`), so a query typed without umlauts finds the term. A query typed as `groesse` does not fold onto `grosse` — therefore German lists carry both spellings where an umlaut occurs (`Größe`, `Groesse`; `zählen`, `zaehlen`).
- **Terms must be findable.** Two tests require that a tool is reachable through its title in both languages and through every single one of its terms, so a dead term is reported instead of sleeping in the catalogue.

Adding a language therefore also means adding these two keys to the new locale file, or the check stops the work with the tool's name in the message.

## Fallback behavior

Each registry entry declares a fallback. English is the current default. Tool catalogs are partial by design: when a selected locale does not contain a tool key, its fallback value is used. If no catalog in the fallback chain contains the key, the key itself is shown so omissions remain visible during development.

## Example registry entry

```ts
fr: {
  label: 'Français',
  direction: 'ltr',
  fallback: 'en',
  messages: { ...commonFr, ...suitesFr }
}
```

An RTL language uses the same structure with `direction: 'rtl'`. Locale and regional preferences such as units, paper size and time format remain separate concerns.
