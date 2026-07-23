# Component Specification: Spinner & LoadingOverlay

1. **Purpose**: Asynchronous loading indicators for inline spinners and full section overlays.
2. **Category**: Feedback Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `SpinnerProps`, `LoadingOverlayProps` (`spinner.types.ts`).
6. **Supported Variants**: Inline spinner, section overlay.
7. **Supported Sizes**: `sm`, `md`, `lg`, `xl`.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: `role="status"`, `aria-label="Loading"`.
10. **Keyboard Support**: Focus prevention during loading overlay.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Centered relative overlay container.
14. **Usage Example**: `<Spinner size="md" />`
15. **Tests**: Covered in `spinner.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
