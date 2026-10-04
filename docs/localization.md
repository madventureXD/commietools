# Localization

CommieTools uses a registry-driven hybrid translation model.

The binding handover and quality rules for planning, Unicode, completeness, search, review and
release live in `uebergabe/02-architektur/sprachpakete.md`. A locale is not made selectable until
that checklist is complete.

## Adding a language

Adding a language follows these steps:

1. Register it in `packages/i18n/src/registry.ts`, including its native label, writing direction and fallback.
2. Add `packages/i18n/src/common/<locale>.ts`.
3. Add `packages/i18n/src/suites/<locale>.ts`.
4. Add it to the lazy interface loader in `packages/i18n/src/index.ts`.
5. Add complete tool translations below every tool's `locales` directory and register them in each tool's local locale index.
6. Run `npm run catalog:generate`; it creates separate search and tool-message modules for the locale.

The web application must not be changed for a new language. Its language selector, browser-language matching, persisted preference, HTML `lang` attribute and `ltr`/`rtl` direction are derived from the registry.

## Ownership

- `packages/i18n/src/common`: navigation, actions, categories, status labels and generic tool UI.
- `packages/i18n/src/suites`: curated suite names and descriptions.
- `packages/tools/src/<category>/<tool>/locales`: wording owned by one tool.

Tools and manifests contain translation keys instead of display strings. The application combines the platform catalog with partial tool catalogs through `createTranslator`.

## Searchable text per tool

Every tool carries two mandatory keys in **every** locale file:

- `tool.<x>.summary` — one line for cards and search results, at most 120 characters, shorter than the description.
- `tool.<x>.terms` — comma-separated search terms. A leading `#` marks a tag, which is shown as a label on the tool card.

Rules the catalogue check enforces: both keys exist in every language, terms are neither empty nor repeated (case-insensitively), and at least one tag exists. `npm run catalog:generate` writes one generated search and tool-message module per language; `npm run check` fails when generated data is out of date.

Two conventions make the German terms work in practice:

- **Folding runs one way only.** Matching resolves umlauts, accents and the sharp s (`Größe` → `grosse`), so a query typed without umlauts finds the term. A query typed as `groesse` does not fold onto `grosse` — therefore German lists carry both spellings where an umlaut occurs (`Größe`, `Groesse`; `zählen`, `zaehlen`).
- **Terms must be findable.** Two tests require that a tool is reachable through its title in both languages and through every single one of its terms, so a dead term is reported instead of sleeping in the catalogue.

Adding a language therefore also means adding these two keys to the new locale file, or the check stops the work with the tool's name in the message.

## Fallback behavior

Each registry entry declares a fallback. English is the current default. At runtime only the selected language and English fallback are loaded; selecting English loads English alone. Public language packs are complete, while the fallback protects against runtime omissions. If neither loaded catalog contains a key, the key itself is shown so omissions remain visible during development.

## Example registry entry

```ts
fr: {
  label: 'Français',
  direction: 'ltr',
  fallback: 'en',
  messages: {}
}
```

An RTL language uses the same structure with `direction: 'rtl'`. Locale and regional preferences such as units, paper size and time format remain separate concerns.
