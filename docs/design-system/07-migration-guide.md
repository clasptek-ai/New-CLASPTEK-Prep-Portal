# Design System Migration Guide

**Status**: Canonical Standard  
**Current Version**: `v2.1.0`

---

## 1. Migration from V1 (Legacy CSS/HTML) to V2.0 (Design System)

### Key Architectural Shifts

- **CSS Variables**: Replaced hardcoded hex values with semantic CSS variables (`var(--bg-surface-0)`, `var(--text-primary)`).
- **Atomic Components**: Replaced loose HTML markups with typed React components from `src/shared/ui/`.
- **Layout System**: Replaced arbitrary absolute positioning with `Stack`, `Grid`, and `Container` primitives.

---

## 2. Component Migration Examples

### Buttons

- **V1 Legacy**: `<button className="btn btn-primary">Submit</button>`
- **V2 Standard**: `<Button variant="primary">Submit</Button>`

### Forms

- **V1 Legacy**: `<input type="text" className="form-control" />`
- **V2 Standard**: `<Input label="Username" error={errors.username} />`

---

## 3. Deprecation Policy & Lifecycle Flags

Components flagged as `Deprecated` in `docs/design-system/component-registry.md` will emit console warnings in development mode and will be removed in major version releases.
