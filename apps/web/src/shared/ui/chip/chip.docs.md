# Component Specification: Chip

1. **Purpose**: Interactive tag chips for filtering, selection, and multi-value tagging.
2. **Category**: Data Display Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `ChipProps` (`chip.types.ts`).
6. **Supported Variants**: FilterChip, ChoiceChip, RemovableChip.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Interactive `role="button"` tag wrapper.
10. **Keyboard Support**: `Enter`/`Space` activation.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Inline flex wrap container.
14. **Usage Example**: `<Chip label="Academic" isSelected onClick={toggle} />`
15. **Tests**: Covered in `chip.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
