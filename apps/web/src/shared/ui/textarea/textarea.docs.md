# Component Specification: Textarea

1. **Purpose**: Multiline text input control for essays and extended comments.
2. **Category**: Form Inputs
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `TextareaProps` (`textarea.types.ts`).
6. **Supported Variants**: Default multiline.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Error`, `Empty`, `Success`, `Responsive`.
9. **Accessibility (WCAG AA)**: `aria-invalid`, `aria-describedby`.
10. **Keyboard Support**: Full multiline keyboard entry.
11. **React Hook Form Compatibility**: `forwardRef` enabled.
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: 100% fullWidth container.
14. **Usage Example**: `<Textarea label="Essay Prompt" rows={6} />`
15. **Tests**: Covered in `textarea.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
