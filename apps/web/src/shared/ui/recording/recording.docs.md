# Component Specification: RecordingIndicator

1. **Purpose**: Speaking test audio recording indicator and status pill.
2. **Category**: Assessment Experience Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `RecordingIndicatorProps` (`recording.types.ts`).
6. **Supported Variants**: RecordingControls, MicrophoneStatus, WaveformPlaceholder.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Recording`, `Paused`, `Stopped`, `Idle`, `Disabled`, `Success`, `Error`, `Warning`, `Responsive`.
9. **Accessibility (WCAG AA)**: Clear textual status indicator.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Flex row layout.
14. **Usage Example**: `<RecordingIndicator status="recording" elapsedSeconds={12} />`
15. **Tests**: Covered in `recording.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
