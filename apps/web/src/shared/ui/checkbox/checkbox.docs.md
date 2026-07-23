# Component Specification: Checkbox

1. **Purpose**: Toggle selection control for boolean form options.
2. **Category**: Selection Controls
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `CheckboxProps` (`checkbox.types.ts`).
6. **Supported Variants**: Single boolean toggle.
7. **Supported Sizes**: `xs`, `sm`, `md`, `lg`, `xl`.
8. **Supported States**: `Loading`, `Disabled`, `Error`, `Empty`, `Success`, `Responsive`.
9. **Accessibility (WCAG AA)**: Bound `htmlFor`, label group association.
10. **Keyboard Support**: `Space` key toggles checked state.
11. **React Hook Form Compatibility**: `forwardRef` enabled.
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Inline label flex wrapper.
14. **Usage Example**: `<Checkbox label="Agree to Terms" {...register('terms')} />`
15. **Tests**: Covered in `checkbox.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
