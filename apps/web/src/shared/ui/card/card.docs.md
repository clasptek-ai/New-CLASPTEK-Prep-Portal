# Component Specification: Card & Surface

1. **Purpose**: Structural container primitive for grouping related content and metrics.
2. **Category**: Foundation Controls
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `CardProps` (`card.types.ts`).
6. **Supported Variants**: `default`, `elevated`, `outlined`, `interactive`, `compact`.
7. **Supported Sizes**: N/A (Padding customizable via `padding` prop).
8. **Supported States**: `Loading`, `Disabled`, `Error`, `Empty`, `Success`, `Responsive`.
9. **Accessibility (WCAG AA)**: Structural semantic container.
10. **Keyboard Support**: Focusable when `variant="interactive"`.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: 100% width fluid container.
14. **Usage Example**: `<Card variant="elevated"><h2>Metric Card</h2></Card>`
15. **Tests**: Covered in `card.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
