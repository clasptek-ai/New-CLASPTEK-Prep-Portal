# Component Specification: Drawer

1. **Purpose**: Slide-out drawer panel overlay for side navigation and filter control panes.
2. **Category**: Overlay Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `DrawerProps` (`drawer.types.ts`).
6. **Supported Variants**: `left`, `right`, `top`, `bottom`.
7. **Supported Sizes**: Customizable width/height string.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: `<div role="dialog" aria-modal="true">`, portal root rendering.
10. **Keyboard Support**: `Escape` key listener.
11. **React Hook Form Compatibility**: Compatible with embedded forms.
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Slide-out fixed edge positioning.
14. **Usage Example**: `<Drawer isOpen={open} onClose={handleClose} title="Filters">Content</Drawer>`
15. **Tests**: Covered in `drawer.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
