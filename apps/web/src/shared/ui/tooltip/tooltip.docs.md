# Component Specification: Tooltip & Popover

1. **Purpose**: Micro-information popups (Tooltip) and floating rich content menus (Popover).
2. **Category**: Overlay Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `TooltipProps`, `PopoverProps` (`tooltip.types.ts`).
6. **Supported Variants**: `top`, `bottom`, `left`, `right`.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: `role="tooltip"`, hover & focus trigger binding.
10. **Keyboard Support**: `Focus` trigger announcement.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Absolute popover positioning bounds.
14. **Usage Example**: `<Tooltip content="Help Text"><button>Icon</button></Tooltip>`
15. **Tests**: Covered in `tooltip.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
