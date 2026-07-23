# Clasptek Prep Portal

# Frontend Implementation Guide (FIG)

## Version 1.0 --- Enterprise Edition

> **Status:** Canonical Frontend Engineering Specification

## Purpose

The Frontend Implementation Guide (FIG) bridges the gap between the
Clasptek Enterprise Blueprint (Volumes I--IV) and production-ready
frontend implementation. It defines standards, architecture, reusable
components, screen implementation patterns, sprint planning, testing,
accessibility, and AI-assisted development workflows.

---

# Table of Contents

1.  Frontend Architecture
2.  Technology Stack
3.  Project Structure
4.  Engineering Standards
5.  Design System
6.  Component Library
7.  Layout System
8.  Routing
9.  Screen Specifications
10. API Integration
11. State Management
12. Performance
13. Accessibility
14. Testing Strategy
15. Sprint Implementation Guide
16. AI Coding Prompts

---

# 1. Frontend Architecture

## Objectives

- Build a scalable enterprise frontend.
- Preserve the existing backend.
- Standardize engineering practices.
- Enable AI-assisted development.

## Relationship to Existing Volumes

- **Volume I** -- Product Architecture (business rules)
- **Volume II** -- UX Blueprint (user journeys)
- **Volume III** -- Examination Engine (behaviour)
- **Volume IV** -- Screen Specifications (UI inventory)

The FIG transforms these into implementation-ready specifications.

---

# 2. Technology Stack

- React 19
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Tailwind CSS
- shadcn/ui
- Supabase Client
- React Hook Form
- Zod
- Framer Motion
- Vitest
- Testing Library
- Playwright

---

# 3. Project Structure

```text
src/
├── app/
├── features/
├── shared/
├── layouts/
├── components/
├── hooks/
├── services/
├── providers/
├── stores/
├── lib/
├── types/
└── assets/
```

Each feature owns its components, hooks, services, and tests.

---

# 4. Engineering Standards

- Feature-first architecture.
- One responsibility per component.
- Components under \~200 lines where practical.
- Typed APIs only.
- Shared UI belongs in `/shared`.
- Business logic belongs in hooks/services.
- No direct API calls inside presentation components.

---

# 5. Design System

## Foundations

- Typography
- Colour Tokens
- Spacing
- Grid
- Responsive Breakpoints
- Icons
- Motion
- WCAG AA Accessibility

---

# 6. Component Library

## Core Components

- Button
- Card
- Input
- Select
- Modal
- Drawer
- Alert
- Toast
- Badge
- Tooltip
- Table

## Assessment Components

- Timer
- Question Navigator
- Passage Viewer
- Essay Editor
- Audio Player
- Recording Panel
- Progress Tracker

## Dashboard Components

- Programme Card
- Progress Card
- Statistics Card
- Notification Panel
- AI Recommendation Panel

Each component specification should include:

- Purpose
- Props
- Variants
- States
- Accessibility
- Tests

---

# 7. Layout System

## Public Layout

- Landing
- Login
- Registration

## Student Layout

- Header
- Programme Navigation
- Content
- Progress Sidebar

## Assessment Layout

- Timer
- Question Area
- Navigator
- Footer Controls

## Admin Layout

- Header
- Sidebar
- Workspace
- Context Panel

---

# 8. Routing

Example routes:

```text
/
/login
/register
/student/dashboard
/student/results
/student/resources
/admin/dashboard
/admin/questions
/admin/reports
```

Each route documents purpose, permissions, entry conditions, exit
conditions, and navigation.

---

# 9. Screen Specification Template

Every screen must define:

- Purpose
- Route
- Components
- API Dependencies
- Hooks
- Loading State
- Empty State
- Error State
- Success State
- Responsive Behaviour
- Accessibility
- Analytics
- Acceptance Criteria

---

# 10. API Integration

For every endpoint specify:

- Endpoint
- Purpose
- Request
- Response
- Errors
- Retry Strategy
- Cache Strategy
- Hook

---

# 11. State Management

- React Query
- Authentication
- Theme
- Notifications
- Assessment Session
- Timer
- Offline Queue

---

# 12. Performance

- Lazy Loading
- Code Splitting
- Suspense
- Virtualisation
- Image Optimisation
- Performance Budgets

---

# 13. Accessibility

- WCAG AA
- Keyboard Navigation
- Screen Reader Support
- Focus Management
- Colour Contrast

---

# 14. Testing Strategy

- Unit Tests
- Integration Tests
- Component Tests
- Route Tests
- Accessibility Tests
- Playwright End-to-End Tests

---

# 15. Sprint Implementation Guide

## Sprint 001

Foundation

Deliver:

- Theme
- Layouts
- Routing
- Authentication Shell

## Sprint 002

Design System

Deliver reusable UI components.

## Sprint 003

Student Dashboard

Deliver:

- Dashboard Layout
- Widgets
- Notifications
- API Integration

## Sprint 004

Programme Workspace

## Sprint 005

Assessment Landing

## Sprint 006

Reading Assessment

## Sprint 007

Listening Assessment

## Sprint 008

Writing Assessment

## Sprint 009

Speaking Assessment

## Sprint 010

Results

## Sprint 011--020

- Practice
- Mock
- Admin
- Question Bank
- AI Review
- Reports
- Settings
- Audit
- Analytics
- Final Polish

---

# 16. AI Coding Prompt Template

For every sprint provide a structured implementation prompt containing:

- Scope
- Technology constraints
- Required components
- Existing APIs
- Acceptance criteria
- Testing requirements
- Accessibility requirements
- Performance requirements

---

# Long-Term Vision

This document evolves into the execution manual for frontend
engineering. Together with Volumes I--IV it provides complete
traceability from business architecture through UX, examination
behaviour, and screen specifications to production-ready frontend
implementation.
