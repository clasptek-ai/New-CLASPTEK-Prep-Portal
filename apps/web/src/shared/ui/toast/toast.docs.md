# Component Specification: Toast

1. **Purpose**: Transient notification toast popups for system feedback.
2. **Category**: Feedback Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `ToastProps`, `ToastItem` (`toast.types.ts`).
6. **Supported Variants**: `info`, `success`, `warning`, `error`.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: `role="status"`, `aria-live="polite"`.
10. **Keyboard Support**: Close button focus handling.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Fixed bottom-right viewport positioning.
14. **Usage Example**: `<Toast toast={{ id: '1', message: 'Profile updated' }} onDismiss={handleDismiss} />`
15. **Tests**: Covered in `toast.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
