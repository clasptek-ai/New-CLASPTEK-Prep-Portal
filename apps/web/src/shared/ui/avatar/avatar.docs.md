# Component Specification: Avatar & AvatarGroup

1. **Purpose**: User profile image representation, initials fallback, and group avatar stack.
2. **Category**: Data Display Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `AvatarProps`, `AvatarGroupProps` (`avatar.types.ts`).
6. **Supported Variants**: Single image, Initials fallback, Status dot.
7. **Supported Sizes**: `xs`, `sm`, `md`, `lg`, `xl`.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Image `alt` binding, text initials fallback.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Flex group overflow stacking.
14. **Usage Example**: `<Avatar name="Jane Doe" status="online" />`
15. **Tests**: Covered in `avatar.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
