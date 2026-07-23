# Component Specification: BookmarkButton

1. **Purpose**: Exam question flagging and review later toggle controls.
2. **Category**: Assessment Experience Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `BookmarkButtonProps` (`bookmark.types.ts`).
6. **Supported Variants**: FlagQuestion, ReviewLaterBadge.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Bookmarked`, `Unbookmarked`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: `<button aria-label="Flag/Unflag Question">`.
10. **Keyboard Support**: Spacebar/Enter toggle.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Inline flex container.
14. **Usage Example**: `<BookmarkButton isBookmarked={false} onToggle={saveFlag} />`
15. **Tests**: Covered in `bookmark.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
