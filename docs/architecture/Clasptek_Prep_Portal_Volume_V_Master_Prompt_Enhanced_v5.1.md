# Clasptek Prep Portal

# Volume V Master Prompt (Enhanced Enterprise Edition)

**Version:** 5.1 Enterprise\
**Purpose:** Generate an implementation-ready Frontend Component Library
& Engineering Specification.

---

# ROLE

You are acting as a joint review and authoring panel comprising:

- Principal Frontend Architect
- Design Systems Director
- Staff React Engineer
- Senior TypeScript Architect
- Principal Product Engineer
- Enterprise UX Architect
- Accessibility Lead (WCAG 2.2 AA)
- Performance Engineer
- QA Automation Lead

---

# AUTHORITATIVE CONTEXT

Volumes I--IV are the **single source of truth**.

Before generating any content:

1.  Read all previous volumes completely.
2.  Preserve every architectural decision.
3.  Preserve naming conventions.
4.  Preserve route names.
5.  Preserve domain terminology.
6.  Preserve AI architecture.
7.  Preserve design tokens.
8.  Never contradict earlier volumes.

Do NOT: - Rewrite previous volumes. - Summarise previous volumes. -
Duplicate previous content. - Invent new product features unless
required to complete engineering contracts.

Where a topic already exists, extend it instead of repeating it.

---

# OBJECTIVE

Produce the definitive implementation specification for every reusable
frontend component required by the Clasptek Prep Portal.

The output must be sufficient for multiple frontend teams to build
independently with minimal product clarification.

Every specification must be implementation-ready.

No placeholders. No generic advice. No educational explanations.

---

# REQUIRED DOCUMENT STRUCTURE

## 1. Design System Package Architecture

- Monorepo structure
- Package boundaries
- Public APIs
- Dependency rules
- Folder conventions
- Ownership
- Versioning strategy

## 2. Complete Component Inventory

Document every reusable component across: - Student - Instructor -
Author - Administrator - Public

## 3. Mandatory Component Template

For **every** component, include:

- Business Purpose
- User Stories
- Functional Description
- Variants
- Sizes
- Design Tokens
- CSS Variable Mapping
- Tailwind Mapping
- TypeScript Interface
- Default Props
- Events
- Event Lifecycle
- State Machine
- Loading States
- Error States
- Empty States
- Disabled States
- Streaming States (where applicable)
- Keyboard Behaviour
- ARIA Mapping
- Focus Rules
- Responsive Behaviour
- Performance Budget
- Analytics Events
- Dependencies
- Anti-patterns
- React Usage Example
- Storybook Story Requirements
- Unit Tests
- Integration Tests
- Accessibility Tests
- Acceptance Criteria
- Definition of Done

## 4. State Contracts

Define standard contracts for: Loading, Success, Failure, Retry,
Pending, Validation, Offline, Optimistic Updates, Rollback, Partial
Loading, Streaming.

## 5. Accessibility

Document WCAG 2.2 AA compliance, ARIA maps, focus management, reduced
motion, screen readers, touch targets and keyboard shortcuts.

## 6. Motion System

Specify duration tokens, easing, springs, transitions, hover, press,
entry, exit and modal/drawer animations.

## 7. Forms

Specify validation, async validation, autosave, dirty state, required
fields and error messaging.

## 8. Enterprise Data Tables

Sorting, filtering, grouping, pagination, virtualization, pinning, bulk
actions, export and accessibility.

## 9. AI Components

Specify transport expectations, conversation continuity, context
retention, loading/error UI, streaming behaviour and fallback UI.

## 10. Analytics

For every component: - Event name - Trigger - Payload - Owner - Business
purpose

## 11. Performance

Define render budgets, bundle budgets, lazy loading, memory usage,
virtualization thresholds and interaction latency.

## 12. Developer Standards

Naming, imports, composition rules, Storybook, semantic versioning,
deprecation policy, contribution workflow and migration guidance.

## 13. Final Readiness Checklist

Confirm: - Every component documented - Every prop documented - Every
state documented - Every accessibility rule documented - Every analytics
event documented - Every engineering contract documented

---

# HARD CONSTRAINTS

- Produce implementation-ready specifications.
- Never leave TODOs or placeholders.
- Never omit component contracts.
- Use consistent terminology from Volumes I--IV.
- Write in enterprise documentation style suitable for direct use by
  engineering teams.
