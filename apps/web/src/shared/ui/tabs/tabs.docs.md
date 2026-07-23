# Component Specification: Tabs

1. **Purpose**: Accessible tabbed navigation control for switching views within a workspace page.
2. **Category**: Navigation Controls
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `TabsProps`, `TabProps`, `TabPanelProps` (`tabs.types.ts`).
6. **Supported Variants**: `default`, `underline`, `pills`, `segmented`.
7. **Supported Orientations**: `horizontal`, `vertical`.
8. **Supported States**: `Active`, `Inactive`, `Hover`, `Focus`, `Disabled`.
9. **Accessibility (WCAG AA)**: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`.
10. **Keyboard Support**: Full `Tab`, `ArrowKeys`, `Home`, `End` focus handling.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Horizontal scrollable container on mobile viewports.
14. **Usage Example**: `<Tabs activeTab={tab} onTabChange={setTab}><TabList><Tab id="1" label="Tab 1" /></TabList><TabPanel id="1">Content</TabPanel></Tabs>`
15. **Tests**: Covered in `tabs.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
