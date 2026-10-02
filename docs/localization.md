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
