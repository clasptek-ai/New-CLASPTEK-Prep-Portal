# Design Tokens Specification

**Status**: Canonical Standard

All UI elements MUST consume token values exported from `src/shared/tokens/tokens.ts` and CSS variables defined in `docs/design-system-2.0.md`.

## Token Categories

- **Typography Scale**: Display, Heading, Title, Body, Caption, Monospace Digits.
- **Color Palette**: Surfaces (`--bg-surface-0` to `--bg-surface-2`), Typography (`--text-primary` to `--text-muted`), Brand Accents (`--primary-500`), Semantic Status (`--success-bg`, `--warning-bg`, `--error-bg`).
- **Spacing Scale**: 4px / 8px Baseline Grid (`2px`, `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`).
- **Elevation**: Flat, Raised, Floating, Modal, Tooltip.
- **Motion**: `150ms cubic-bezier(0.16, 1, 0.3, 1)`.
