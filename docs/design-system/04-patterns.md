# UI Composition & Layout Patterns

**Status**: Canonical Standard

- **Dashboard Layout Pattern**: 12-column grid (`grid-template-columns: repeat(12, 1fr)`), 4 KPI Stat Cards on desktop (`3 cols each`), 2-column detail grid below.
- **Form Composition Pattern**: Vertical form group stack with `8px` gap, `Input` with bound `Label` and `FieldError` messages.
- **Assessment Runtime Pattern**: Fullscreen focus shell (`AssessmentLayout`), top persistent timer, left content pane, right answer sheet, bottom question navigator bar.
