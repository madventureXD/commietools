/**
 * Zentrale Lint-Konfiguration (Karte M4-008).
 *
 * **Warum es diese Datei gibt:** `npm run lint` lief bis zum 2026-10-06 ins Leere — die Wurzel
 * reichte an die Arbeitsbereiche weiter (`--workspaces --if-present`), und **kein** Arbeitsbereich
 * hatte ein `lint`-Skript. Das Kommando endete mit Exit 0, ohne eine einzige Datei anzusehen: ein
 * grüner Qualitätsnachweis für nichts.
 *
 * **Auswahl der Regeln:** risikoorientiert, wie die Karte es verlangt — Hooks, unbehandelte
 * Promises, sinnlose Typbehauptungen, ungenutzte Namen, erschöpfende Fallunterscheidung. Keine
 * Formatierungsregeln: ein Formatierungsumbau würde funktionale Reparaturen unlesbar machen.
 *
 * **Erzeugte Dateien sind eng ausgenommen**, nicht pauschal: `catalog/generated/**` wird von
 * `npm run catalog:generate` geschrieben und nachweislich von `catalog:check` geprüft; `dist/**`
 * ist Bauergebnis. Alles andere wird geprüft.
 */
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'packages/tools/src/catalog/generated/**',
      'packages/tools/src/pdf/m7-wasm/**',
      '**/target/**',
      'QM/**',
      'tmp/**',
      /**
       * `work/**` enthält die Beleg- und Messskripte der Sitzungen. Sie liegen **außerhalb der
       * Versionierung** (offener Punkt M10-004: die tragenden Belege gehören nach
       * `scripts/belege/`) und sind teils absichtliche Skizzen. Als Qualitätsnachweis der
       * Produktbasis sind sie ungeeignet — gemessen erzeugten sie beim ersten Lauf 1718 von 1718
       * Treffern zum größten Teil allein. Sie werden deshalb nicht bewertet; sobald ein Skript
       * tragend ist, gehört es versioniert nach `scripts/`.
       */
      'work/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        /**
         * Die Paketquellen (`packages/*`) haben kein eigenes tsconfig — ihre Quellen werden sonst
         * nur mitgezogen, weil `apps/web/src` sie importiert. Ohne ein zusammenfassendes Projekt
         * meldete der Parser für 290 Dateien "was not found by the project service" und prüfte
         * dort keine einzige Regel. Das Wurzel-`tsconfig.json` fasst die Produktquellen für die
         * Prüfung zusammen; `projectService` findet es von selbst.
         */
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      /**
       * **Als Fehler geführt — die fünf Risikoregeln der Karte:**
       * Hooks, unbehandelte Promises, sinnlose Typbehauptungen, ungenutzte Namen, erschöpfende
       * Fallunterscheidung. Diese müssen behoben sein, sonst ist der Lauf rot.
       */
      'react-hooks/rules-of-hooks': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none',
        // `const { locales: _locales, ...entry } = x` lässt bewusst ein Feld weg.
        ignoreRestSiblings: true
      }],
      /**
       * `considerDefaultExhaustiveForUnions`: Beide gefundenen Switches (`Commercial.tsx`,
       * `packages/tools/src/index.ts`) führen ein **bewusstes** `default` als Rückfall. Ohne diese
       * Option meldete die Regel sie als unvollständig — ein Fehlalarm, denn der Rückfall ist
       * genau die Absicht. Die Prüfung bleibt damit scharf für Switches **ohne** Rückfall.
       */
      '@typescript-eslint/switch-exhaustiveness-check': ['error', { considerDefaultExhaustiveForUnions: true }],

      /**
       * **Als Warnung geführt, mit Grund:** Diese Regeln treffen in diesem Projekt überwiegend
       * gültige Muster an den Typgrenzen (Fremdbibliotheken ohne strenge Typen, `any` aus
       * Drittanbieter-Schnittstellen, `async`-Handler in JSX). Sie als Fehler zu führen erzeugte
       * 139 Treffer, von denen der überwiegende Teil kein Risiko ist — ein Freigabeschutz, den
       * niemand beheben kann, wird abgeschaltet statt beachtet. Sie bleiben sichtbar und werden
       * im Lauf berichtet; die Behebung ist eigene Arbeit.
       */
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/unbound-method': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    /**
     * JavaScript-Dateien (Prüfskripte, Belegskripte, diese Konfiguration selbst) sind
     * Node-Programme und gehören zu keinem TypeScript-Projekt — typgestützte Regeln können dort
     * keine Typinformation gewinnen und brechen sonst mit "requires type information" ab
     * (gemessen beim ersten Lauf an genau dieser Datei).
     */
    files: ['**/*.{mjs,cjs,js}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
    rules: {
      // Dieselben Ausnahmen wie im TypeScript-Block — sonst prüft die Regel die Prüfskripte
      // strenger als den Produktcode (`const { locales: _locales, ...entry }` in einem Generator).
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none',
        ignoreRestSiblings: true
      }]
    }
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      // In Tests sind Prüfungen ohne Zuweisung üblich und gewollt.
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
)
