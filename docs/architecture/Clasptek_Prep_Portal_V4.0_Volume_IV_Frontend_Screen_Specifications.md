# Clasptek Prep Portal V4.0 Enterprise Blueprint

# Volume IV --- Frontend Screen Specifications

**Version:** 4.0 (Foundational Edition)

> This volume defines the functional specification for every frontend
> screen. It serves as the implementation contract between Product, UX,
> Frontend Engineering, Backend Engineering and QA.

---

# Table of Contents

1.  Screen Specification Standard
2.  Global Layout Standards
3.  Design System Rules
4.  Admin Workspace Screens
5.  Student Portal Screens
6.  Examination Screens
7.  Shared Components
8.  Accessibility Standards
9.  Analytics Events
10. Acceptance Criteria

---

# 1. Screen Specification Standard

Every screen shall contain:

- Purpose
- Primary actor
- Route
- Entry conditions
- Exit conditions
- Layout
- Components
- API dependencies
- Data requirements
- Permissions
- Validation
- Loading state
- Empty state
- Error state
- Success state
- Analytics events
- Accessibility
- Acceptance criteria

---

# 2. Global Layout Standards

## Admin Layout

Header → Left Navigation → Workspace → Context Panel → Footer

## Student Layout

Header → Programme Navigation → Content Area → Progress Panel

## Examination Layout

Header (Timer + Progress) → Question Area → Question Navigator → Bottom
Navigation

No global menu is visible during examinations.

---

# 3. Design System Rules

- Consistent spacing
- Responsive grid
- Keyboard-first navigation
- Reusable components
- Theme consistency
- WCAG-aligned interaction

---

# 4. Admin Workspace Screens

## Dashboard

Purpose: Operational overview.

Widgets: - Registrations - Active Students - Assessment Queue - AI
Queue - Programme Health - Notifications

Acceptance: Dashboard loads within target performance budget and
reflects role permissions.

---

## Student List

Features: - Search - Filter - Sort - Bulk Actions - Export

States: Loading Empty Permission Denied Error

---

## Student Profile

Sections: - Profile - Programmes - Assessment History - Practice
History - Mock History - Results - Notes - Audit Trail

---

## Question Editor

Supports: - Reading - Listening - Writing - Speaking - Metadata -
Version History - Preview - Publish Workflow

---

# 5. Student Portal Screens

## Dashboard

Widgets: - Current Programme - Next Action - Practice Progress - Mock
Eligibility - Recent Results - Notifications

---

## Programme Home

Displays: - Overview - Learning Path - Resources - Assessments -
Practice - Mock

---

## Results

Displays: - Overall Score - Skill Breakdown - AI Feedback - Trend
Analysis - Recommendations

---

# 6. Examination Screens

## Assessment Landing

Components: - Instructions - Candidate Information - Time Allocation -
Rules - Begin Button

---

## Reading Screen

Components: - Passage - Questions - Timer - Navigator - Flag - Save -
Next

Business Rules: - Timed - Strict navigation - Auto-save

---

## Listening Screen

Components: - Audio Player - Transcript (where allowed) - Questions -
Timer - Navigator

---

## Writing Screen

Components: - Prompt - Rich Text Editor - Word Counter - Timer - Save
Indicator

---

## Speaking Screen

Components: - Prompt - Recording Controls - Timer - Retry Policy -
Upload Status

---

## Mock Completion

Displays: - Confirmation - Submission Status - Processing Status

---

# 7. Shared Components

- Header
- Sidebar
- Breadcrumbs
- Timer
- Progress Bar
- Question Navigator
- Notifications
- Modal Dialog
- Confirmation Dialog
- Empty State
- Loading Skeleton
- Error Banner

Each component shall have its own specification in future revisions.

---

# 8. Accessibility Standards

Every screen must support:

- Keyboard navigation
- Screen readers
- Focus indicators
- Contrast compliance
- Responsive layouts

---

# 9. Analytics Events

Capture:

- Screen Viewed
- Button Clicked
- Question Answered
- Save Triggered
- Assessment Started
- Assessment Submitted
- Practice Completed
- Mock Completed

---

# 10. Acceptance Criteria

Every screen requires:

- Functional acceptance
- UX acceptance
- Accessibility acceptance
- Security validation
- Performance validation
- API validation
- QA test cases

> Future editions will expand this volume into individual specifications
> for every page, modal, drawer and reusable component across the
> platform.
