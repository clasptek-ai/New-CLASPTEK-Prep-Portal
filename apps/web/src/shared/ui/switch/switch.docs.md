# Component Specification: Switch

1. **Purpose**: Toggle switch control for binary settings and preferences.
2. **Category**: Selection Controls
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `SwitchProps` (`switch.types.ts`).
6. **Supported Variants**: Toggle switch.
7. **Supported Sizes**: `xs`, `sm`, `md`, `lg`, `xl`.
8. **Supported States**: `Loading`, `Disabled`, `Error`, `Empty`, `Success`, `Responsive`.
9. **Accessibility (WCAG AA)**: Explicit `role="switch"`, bound `htmlFor`.
10. **Keyboard Support**: `Space` key toggles active state.
11. **React Hook Form Compatibility**: `forwardRef` enabled.
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Inline label wrapper.
14. **Usage Example**: `<Switch label="Email Alerts" {...register('alerts')} />`
15. **Tests**: Covered in `switch.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
