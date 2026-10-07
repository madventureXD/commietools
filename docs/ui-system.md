# Tool UI system

## Shared flow

All applicable tools use four recognizable stages:

1. Input
2. Settings
3. Action
4. Result

The shell may adapt to file tools, editors, calculators, generators, text/code tools and viewers, but navigation, feedback and action placement remain consistent.

## Interaction rules

- The primary action is visually dominant and placed consistently.
- Destructive actions never resemble or crowd the primary action.
- Advanced settings start collapsed.
- Exact numeric fields accompany sliders where precision matters.
- Keyboard and touch interactions are first-class.
- No required action is available only through hover, right-click or a hidden gesture.
- Errors appear next to the affected input and explain recovery.
- Motion respects `prefers-reduced-motion`.
- Color is never the only carrier of meaning.
- Every generated file shows an editable file name before saving. Supporting browsers use a native
  **Save as…** dialog; other browsers use a clearly explained download fallback. File type, MIME
  type and extension must stay consistent.
- Tools with multiple results expose the same name and save control for every file. They never
  trigger a series of automatic downloads.

## Themes

Light and dark modes share identical structure. Semantic design tokens define surfaces, text, borders, focus, action and status colors. The initial palette uses red as the brand/action color; category colors are secondary orientation cues.

## Accessibility baseline

Semantic HTML, visible keyboard focus, 44px minimum interactive targets, sufficient contrast, zoom-safe layouts and localized accessible names are required. Automated accessibility checks should be added with the first component test suite.

### Accessible names are interface text, not source text (card M2-006)

- Accessible names (`aria-label`, `aria-labelledby`, `alt`, group labels) come from the i18n keys —
  **never** as literal text in JSX. They must change with the language like any visible text.
  Measured 2026-10-07: `aria-label="Main navigation"` and `aria-label="Case mode"` stayed English
  in all three languages; both are now `nav.main` and `caseConverter.mode` in
  `packages/i18n/src/common/*`.
- A group needs a **semantic contract**, not just an attribute on a plain `div`: a named
  `role="group"` (or `fieldset`/`legend` where a form is involved) with a translated label.
- The **active selection must be exposed**: a segmented control marks its current choice with
  `aria-pressed` (or a radio contract), so the state is part of the accessibility tree instead of
  only a CSS class.
- Literal strings that are *not* interface text stay literal: date/time format examples
  (`2026-10-03`) and mathematical expressions (`x^2 - 4`) are not translated.
- When a workflow is created, visible JSX literals and accessible attributes are checked
  **together** — a visible label that is translated while its ARIA attribute stays English is the
  normal case of this mistake.

### Layout contracts for narrow widths (card M7-005)

- Grid tracks are declared **intrinsically safe**: `minmax(0, 1fr)` instead of a bare `1fr`
  (a bare `1fr` is `minmax(auto, 1fr)` and cannot shrink below its content's minimum size), and
  `minmax(min(100%, X), 1fr)` instead of a fixed `minmax(X, 1fr)` in `auto-fill`/`auto-fit` grids.
  Measured 2026-10-07: a bare `1fr` in the narrow-width rules pushed the catalogue to 405px inside
  a 320px viewport once text spacing was applied.
- Flex/grid children that carry text get `min-width: 0`; rows whose labels can grow get
  `flex-wrap: wrap` so an action label moves to the next line instead of leaving the box.
- **`overflow: hidden` is not a repair.** It hides the symptom and the function with it.
- Checked states: home, menu open, a tool with a result, long file names — in de/en/es at
  320px and 390px, plus text spacing (WCAG 1.4.12) and 200% zoom.

## Catalogue and search

The tool catalogue is the platform's entry surface and follows its own visible rules:

- Every card shows the tool's symbol, its category, its title, the one-line summary from the catalogue and its tags. The long description stays on the tool page.
- Search answers from two characters on and states the result count; below that it lists everything instead of pretending to search.
- Every result says what it matched on (`gefunden über …` / `found via …`), in the language the catalogue is displayed in. A German query may match an English term and vice versa; the result is still shown in the selected language, only the matched word keeps its own language.
- A hit inside a long sentence is reported with the single word, never with the whole sentence.
- No fuzzy matching and no suggestions when nothing matches: an empty result is stated plainly, with a hint at what else to try.
- While a search is active the suite list is hidden, because curated collections are not searchable.
- File types shown to the user (`Formate`, `Nur lesbar`, the `accept` attribute) come from the manifest declaration, never from a literal in the interface.

## Global tool navigation

- Every normal route exposes the same labelled tool-menu trigger before the brand.
- Desktop uses a left overlay drawer so editors keep their full working width; below 768 px the
  drawer becomes a full-width sheet beneath the header.
- The menu reuses the generated catalogue and the normal search implementation. It never imports
  a tool implementation or optional engine.
- Categories are the default and start as collapsed accordions with a tool count; A–Z, recent tools
  and favorites are alternative flat views. Future subcategories use the same nested disclosure
  pattern and remain limited to two navigation levels.
- Favorites and the ten most recent tool IDs are stored only on the device. Search text and user
  file information are never persisted.
- Escape, the backdrop, the close button and the mobile back action close the menu and restore
  focus to its trigger.

## Detaching a tool into its own window

Every tool route carries the same shell bar above the tool header. It holds exactly one control and
is hidden while empty. The catalogue, the suite pages, the licence page and the legal notice are not
detachable: they are entry surface, not workbenches.

- The control is offered **only** where the capability really exists. The test is a runtime check on
  `typeof window.documentPictureInPicture?.requestWindow === 'function'`, never a browser name. Where
  the platform has no such window (Safari, mobile), the button is absent instead of half-working.
- **One instance, two places.** Detaching moves the running tool into the second document through a
  portal; the component is not mounted again, so its local state and any running computation stay the
  same. The main window shows a placeholder that says the tool is running in its own window and
  remains the place from which it can be brought back. There is never a second copy of a tool state.
- The control stays in the main window and drives the second window by its id, so the way back
  remains reachable while the tool is outside. Its visible text and its accessible name switch
  together between detaching and returning, and both are translated.
- **The wanted size is measured, not declared.** Before the content moves, the size the tool
  occupies in the main window is taken; after the window opens, its inner size is compared with that
  measurement. Only when the two differ does a fitting aid appear — inside the detached window, with
  its own translated text and a button that fits the window to the measurement. `resizeTo()` sets the
  outer size, so the difference to the inner size (frame width and title bar) is added; the click must
  happen in the detached window because only there does it count as the authorising gesture. No
  catalogue field holds a window size, because a declared size would be a promise the platform does
  not keep.
- **The colour scheme travels with the content.** The theme attribute normally sits on the app
  element of the main window; the second document does not know it, and `copyStyles: 'sync'` copies
  style sheets, not attributes. It is therefore written into the second document when the window
  opens and again on every change of the theme.
- The detached window keeps the accessibility baseline: keyboard reachable, translated accessible
  name, minimum target size, and focus back on the control after closing.

Platform limits that are documented rather than promised: the window size on opening cannot be
prescribed (Chromium uses the size of the calling window), the position cannot be set, one window per
tab, it never outlives the window it came from, it cannot be navigated, fullscreen is blocked inside
it, and both top-level context and HTTPS are required.

