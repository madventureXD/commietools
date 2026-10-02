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

## Themes

Light and dark modes share identical structure. Semantic design tokens define surfaces, text, borders, focus, action and status colors. The initial palette uses red as the brand/action color; category colors are secondary orientation cues.

## Accessibility baseline

Semantic HTML, visible keyboard focus, 44px minimum interactive targets, sufficient contrast, zoom-safe layouts and localized accessible names are required. Automated accessibility checks should be added with the first component test suite.

