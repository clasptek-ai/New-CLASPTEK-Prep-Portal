# Component Specification: Select & MultiSelect

1. **Purpose**: Dropdown selection control for choosing options in form flows.
2. **Category**: Selection Controls
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `SelectProps` (`select.types.ts`).
6. **Supported Variants**: Single selection and Multi-select.
7. **Supported Sizes**: `xs`, `sm`, `md`, `lg`, `xl`.
8. **Supported States**: `Loading`, `Disabled`, `Error`, `Empty`, `Success`, `Responsive`.
9. **Accessibility (WCAG AA)**: Bound `htmlFor`, `aria-invalid`, `aria-describedby`.
10. **Keyboard Support**: Standard native dropdown keyboard navigation.
11. **React Hook Form Compatibility**: `forwardRef` enabled.
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: 100% fullWidth control.
14. **Usage Example**: `<Select label="Programme" options={programmes} />`
15. **Tests**: Covered in `select.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
