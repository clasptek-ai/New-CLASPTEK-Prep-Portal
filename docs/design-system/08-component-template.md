# Clasptek Component Specification Standard Template

**Status**: Canonical Standard

Every component in the Clasptek Design System MUST follow this 16-point specification structure in its `Component.docs.md`:

```markdown
# Component Specification: [ComponentName]

1. **Purpose**: High-level explanation of component usage.
2. **Category**: (e.g., Foundation / Forms / Navigation / Feedback / Data Display / Assessment).
3. **Owner**: (e.g., Platform Team / Exam Team).
4. **Version**: `v1.0.0`
5. **Props Interface**: TypeScript DTO definitions (`[ComponentName].types.ts`).
6. **Supported Variants**: (e.g., Primary, Secondary, Outline, Ghost, Danger, Success, Warning, Link).
7. **Supported Sizes**: `xs` | `sm` | `md` | `lg` | `xl`.
8. **Supported States**: `Loading` | `Disabled` | `Error` | `Empty` | `Success` | `Responsive`.
9. **Accessibility (WCAG AA)**: Focus rings, ARIA roles, and screen-reader announcements.
10. **Keyboard Support**: Keybindings (`Tab`, `Space`, `Enter`, `Escape`).
11. **React Hook Form Compatibility**: `forwardRef`, `register()`, `Controller`, `aria-invalid`.
12. **Theme Support**: Dynamic Light/Dark token mappings.
13. **Responsive Behavior**: Container bounds and mobile touch targets (≥ 44px).
14. **Usage Example**: Code snippet demonstrating form composition.
15. **Tests**: Vitest unit test coverage suite.
16. **Changelog**: Release history (`CHANGELOG.md`).
```
