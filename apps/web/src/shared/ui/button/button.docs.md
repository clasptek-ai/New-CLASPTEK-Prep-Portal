# Component Specification: Button

1. **Purpose**: Primary interactive trigger element for user actions.
2. **Category**: Foundation Controls
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `ButtonProps` (`button.types.ts`).
6. **Supported Variants**: `primary`, `secondary`, `outline`, `ghost`, `link`, `danger`, `success`, `warning`.
7. **Supported Sizes**: `xs`, `sm`, `md`, `lg`, `xl`.
8. **Supported States**: `Loading`, `Disabled`, `Error`, `Empty`, `Success`, `Responsive`.
9. **Accessibility (WCAG AA)**: Focus ring, `aria-busy` when loading, keyboard `Enter`/`Space` trigger.
10. **Keyboard Support**: Full `Tab` focus and activation.
11. **React Hook Form Compatibility**: `forwardRef` enabled for submission buttons.
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: `fullWidth` prop expands container bounds on mobile.
14. **Usage Example**: `<Button variant="primary" size="md">Save Changes</Button>`
15. **Tests**: Covered in `button.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
