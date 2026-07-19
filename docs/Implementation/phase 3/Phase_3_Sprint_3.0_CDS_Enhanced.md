# Phase 3 Sprint 3.0 --- Clasptek Design System (CDS) v1.0 (Enhanced)

## Executive Summary

The Clasptek Design System (CDS) is the canonical UI foundation for
Clasptek Prep Portal V2. Every screen, component and interaction MUST
consume CDS components.

## New Enhancements (100/100 Baseline)

### 1. Design Token JSON Specification

Maintain `/packages/design-tokens/tokens.json`.

```json
{
  "color": {
    "primary": { "500": "#1E5EFF" },
    "success": { "500": "#22C55E" },
    "warning": { "500": "#F59E0B" },
    "danger": { "500": "#EF4444" }
  },
  "spacing": { "xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 32 },
  "radius": { "sm": 4, "md": 8, "lg": 12 },
  "shadow": { "sm": "...", "md": "..." }
}
```

### 2. Figma Naming Standard

Component hierarchy: - CDS/Button/Primary - CDS/Button/Secondary -
CDS/Input/Text - CDS/Card/Student - CDS/Exam/QuestionCard -
CDS/Admin/DataTable

### 3. Motion Standards

- Hover: 150ms
- Click: 100ms
- Modal: 250ms
- Drawer: 300ms
- Page transition: 300ms
- Skeleton pulse: 1200ms

### 4. Icon Library

Use Lucide icons consistently. Define icons for Student, Admin, Exams,
Status, Navigation and Resources.

### 5. Empty States

Each feature must define: - Illustration - Title - Description - Primary
action - Secondary action

### 6. Skeleton Loading

Every data page requires skeleton components matching the final layout.

### 7. Print Styles

Provide printable layouts for: - Results - Progress reports - Student
profile - Admin reports

### 8. Email Design System

Templates: - Welcome - Password Reset - Assessment Ready - Practice
Unlocked - Mock Unlocked - Result Notification

### 9. PDF / Report Standards

Common headers, typography, branding, page numbers and QR code support.

### 10. RTL Readiness

No hardcoded left/right spacing. Logical CSS properties only.

## Component Documentation Template

Every component documents: - Purpose - Anatomy - Variants - States -
Accessibility - Responsive behaviour - API/Props - Code example -
Anti-patterns - Tests - Acceptance criteria
