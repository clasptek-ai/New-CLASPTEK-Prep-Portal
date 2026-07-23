# Component Specification: AssessmentTimer

1. **Purpose**: High-precision examination timer for IELTS, TOEFL, SAT, and practice tests.
2. **Category**: Assessment Experience Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `AssessmentTimerProps` (`timer.types.ts`).
6. **Supported Variants**: CountdownTimer, ElapsedTimer.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Running`, `Paused`, `Expired`, `Disabled`, `Success`, `Error`, `Warning`, `Responsive`.
9. **Accessibility (WCAG AA)**: `role="timer"`, `aria-label`.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Tabular numeric layout bounds.
14. **Usage Example**: `<AssessmentTimer seconds={1800} onTimeExpired={handleFinish} />`
15. **Tests**: Covered in `timer.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
