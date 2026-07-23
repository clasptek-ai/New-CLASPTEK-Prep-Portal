# Clasptek Design System (CDS) v1.0 Guidelines

## Overview

The Clasptek Design System (CDS) is the canonical UI foundation for Clasptek Prep Portal V2. Every user interface component, layout, and interaction MUST consume CDS design tokens and components exported from `@clasptek/design-system`.

## Principles

1. **Single Source of Truth**: `/packages/design-tokens/tokens.json` defines all visual styles.
2. **Accessibility**: All components adhere to WCAG 2.2 AA standards.
3. **Motion**: Standardized animation durations (Hover 150ms, Modal 250ms, Drawer 300ms, Skeleton 1200ms).
4. **Zero Hardcoded CSS**: Use logical CSS properties (`margin-inline`, `padding-inline`) for full RTL compatibility.
