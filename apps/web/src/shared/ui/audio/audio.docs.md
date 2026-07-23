# Component Specification: AudioPlayer

1. **Purpose**: Listening test audio player for IELTS and TOEFL examinations.
2. **Category**: Assessment Experience Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `AudioPlayerProps` (`audio.types.ts`).
6. **Supported Variants**: AudioControls, PlaybackIndicator, VolumeControl.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: `<button aria-label="Play/Pause Audio">`.
10. **Keyboard Support**: Spacebar toggle play/pause.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Flex row layout.
14. **Usage Example**: `<AudioPlayer src="/audio/section1.mp3" title="Section 1" />`
15. **Tests**: Covered in `audio.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
