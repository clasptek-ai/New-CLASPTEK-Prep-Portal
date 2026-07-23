# Component Specification: Input Controls

1. **Purpose**: Form text input control with label, validation error, icon slots, and RHF compatibility.
2. **Category**: Form Inputs
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `InputProps` (`input.types.ts`).
6. **Supported Variants**: `default`, `filled`, `outlined`, `readOnly`, `invalid`.
7. **Supported Sizes**: `xs`, `sm`, `md`, `lg`, `xl`.
8. **Supported States**: `Loading`, `Disabled`, `Error`, `Empty`, `Success`, `Responsive`.
9. **Accessibility (WCAG AA)**: Bound `htmlFor`, `aria-invalid`, `aria-describedby`, `role="alert"`.
10. **Keyboard Support**: Full keyboard input and focus outlines.
11. **React Hook Form Compatibility**: Full `forwardRef` support for `register()` and `Controller`.
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: 100% fullWidth form control layout.
14. **Usage Example**: `<Input label="Email" error={errors.email?.message} {...register('email')} />`
15. **Tests**: Covered in `input.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
