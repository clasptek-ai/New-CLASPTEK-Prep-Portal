# Component Specification: RadioGroup

1. **Purpose**: Exclusive selection control group for choosing one option from a set.
2. **Category**: Selection Controls
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `RadioGroupProps` (`radio.types.ts`).
6. **Supported Variants**: Vertical radio group list.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Error`, `Empty`, `Success`, `Responsive`.
9. **Accessibility (WCAG AA)**: Semantic `<fieldset>` and `<legend>` container.
10. **Keyboard Support**: Arrow key navigation across radio options.
11. **React Hook Form Compatibility**: `forwardRef` enabled.
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Vertical flex layout.
14. **Usage Example**: `<RadioGroup name="plan" options={plans} />`
15. **Tests**: Covered in `radio.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
