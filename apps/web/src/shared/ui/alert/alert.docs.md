# Component Specification: Alert

1. **Purpose**: Static callout banner for informing users about critical updates, errors, warnings, and success messages.
2. **Category**: Feedback Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `AlertProps` (`alert.types.ts`).
6. **Supported Variants**: `info`, `success`, `warning`, `error`.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: `role="alert"`, `aria-live="assertive"`.
10. **Keyboard Support**: Close button focus handling.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Flex row layout wrapping text smoothly on mobile viewports.
14. **Usage Example**: `<Alert variant="error"><AlertTitle>Error</AlertTitle><AlertDescription>Save failed.</AlertDescription></Alert>`
15. **Tests**: Covered in `alert.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
