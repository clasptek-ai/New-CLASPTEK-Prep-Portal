# Migration Guide — @clasptek/design-system v3.0.0

## Migrating to CDS v1.0

1. Replace legacy `@clasptek/ui` imports with `@clasptek/design-system`.
2. Wrap root layouts in `<ThemeProvider defaultTheme="dark">`.
3. Wrap layout elements in `Stack`, `Inline`, `Grid`, and `Container` primitives.
4. Replace raw `<button>` and `<input>` elements with CDS `Button` and `Form` components.
5. Replace hardcoded colors with CSS variables `var(--cds-color-*)` or semantic tokens.
