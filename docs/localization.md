# Localization

CommieTools uses a hybrid translation model.

## Ownership

- `packages/i18n/src/common`: shared navigation, actions, categories, status labels and generic tool UI.
- `packages/i18n/src/suites`: curated suite names and descriptions.
- `packages/tools/src/<category>/<tool>/locales`: wording owned by one tool.

Tools and manifests contain translation keys instead of display strings. The web application combines the platform catalog with the tool catalog through `createTranslator`.

## Fallback behavior

English is the reference fallback. When a selected locale does not contain a key, its English value is used. If neither catalog contains the key, the key itself is shown so omissions remain visible during development.

## Adding tool text

Add matching keys to the tool's `locales/de.ts` and `locales/en.ts`, then include both resources in `packages/tools/src/locales.ts`. Do not place tool-specific wording in the shared catalog.

## Adding a language

A new locale must provide shared resources first. Tool resources can then be added incrementally because English remains available as a fallback. Locale and regional preferences such as units, paper size and time format remain separate concerns.
