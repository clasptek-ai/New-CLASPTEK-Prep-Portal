# Component Specification: Modal & ConfirmDialog

1. **Purpose**: Modal dialog box overlays for critical user actions, forms, and alerts.
2. **Category**: Overlay Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `ModalProps`, `ConfirmDialogProps` (`modal.types.ts`).
6. **Supported Variants**: `sm`, `md`, `lg`, `xl`.
7. **Supported Sizes**: `sm`, `md`, `lg`, `xl`.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: `<div role="dialog" aria-modal="true">`, portal root rendering.
10. **Keyboard Support**: `Escape` key close listener, focus restoration.
11. **React Hook Form Compatibility**: Compatible with embedded forms.
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Max width bounds with scrollable internal body.
14. **Usage Example**: `<Modal isOpen={open} onClose={handleClose} title="Terms">Content</Modal>`
15. **Tests**: Covered in `modal.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
