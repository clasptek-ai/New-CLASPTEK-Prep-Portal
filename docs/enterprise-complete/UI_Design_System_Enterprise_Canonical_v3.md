---
name: Clasptek Global Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434750'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737781'
  outline-variant: '#c3c6d2'
  surface-tint: '#335e9e'
  primary: '#00346b'
  on-primary: '#ffffff'
  primary-container: '#1b4b8a'
  on-primary-container: '#97bdff'
  inverse-primary: '#a9c7ff'
  secondary: '#bb0014'
  on-secondary: '#ffffff'
  secondary-container: '#e41f25'
  on-secondary-container: '#fffbff'
  tertiary: '#253648'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c4d60'
  on-tertiary-container: '#acbed4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a9c7ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#144685'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000d'
  tertiary-fixed: '#d2e4fb'
  tertiary-fixed-dim: '#b6c8df'
  on-tertiary-fixed: '#0a1d2d'
  on-tertiary-fixed-variant: '#37485b'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-page: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

# Clasptek Prep Portal V2

# Enterprise UI Design System

## Canonical Design Specification

**Document Version:** 3.0.0  
**Baseline ID:** `ui-design-system-v3`  
**Design System Version:** `v3`

> This document is the authoritative UI governance specification for all Clasptek products.

---

# 1. Purpose

Defines the complete visual language, reusable components, interaction patterns, accessibility requirements, design tokens, implementation standards and governance model for Clasptek Prep Portal V2.

---

# 2. Brand & Style

The design system is anchored in the principles of **Corporate Modernism**, blending the authority of enterprise SaaS with the forward-thinking clarity of AI-driven education. The visual narrative balances high-trust stability with technical innovation. 

The aesthetic is defined by "Precision Clarity"—utilizing expansive white space, a structured grid, and purposeful data visualization to make complex information digestible. The experience should feel intelligent, dependable, and highly efficient, evoking a sense of calm mastery over complex datasets.

---

# 3. Colors

The palette is derived directly from the core brand identity, optimized for digital accessibility and depth.

- **Primary (Deep Blue):** `#00346b`. Used for navigation, primary actions, and key brand moments. It represents stability and professional depth.
- **Secondary (Clasptek Red):** `#bb0014`. Reserved for critical status indicators, semantic errors, and high-contrast call-to-actions.
- **Functional Grays:** A refined scale of cool grays (from `#f7f9fb` to `#191c1e`) handles surface layering, borders, and secondary text.
- **AI Accents:** Subtle gradients mixing the Primary Blue (`#00346b`) with a lighter cyan (`#335e9e` or `#97bdff`) are used exclusively for AI-powered features and insights to differentiate automated logic from manual data.

### Global Design System Color Tokens

| Token | Hex | Target Usage |
| :--- | :--- | :--- |
| `surface` | `#f7f9fb` | Canvas / background |
| `surface-dim` | `#d8dadc` | Muted background layering |
| `surface-bright` | `#f7f9fb` | High contrast canvas |
| `surface-container-lowest` | `#ffffff` | Elevated structures, inputs, text areas |
| `surface-container-low` | `#f2f4f6` | Default card body background |
| `surface-container` | `#eceef0` | Default divider backgrounds, tabs |
| `surface-container-high` | `#e6e8ea` | Table headers, muted button states |
| `surface-container-highest` | `#e0e3e5` | Active state indicators, border highlights |
| `on-surface` | `#191c1e` | Main headers and body text |
| `on-surface-variant` | `#434750` | Muted secondary metadata text |
| `inverse-surface` | `#2d3133` | Snackbars, dark overlays |
| `inverse-on-surface` | `#eff1f3` | Text inside dark overlays |
| `outline` | `#737781` | Default component borders |
| `outline-variant` | `#c3c6d2` | Inner table borders and rules |
| `surface-tint` | `#335e9e` | Element decoration, overlay accents |
| `primary` | `#00346b` | Main primary buttons, brand accents |
| `on-primary` | `#ffffff` | Primary button text |
| `primary-container` | `#1b4b8a` | Selected states, primary highlights |
| `on-primary-container` | `#97bdff` | Text inside selected state containers |
| `inverse-primary` | `#a9c7ff` | Primary toggle in dark overlays |
| `secondary` | `#bb0014` | Destructive buttons, error highlights |
| `on-secondary` | `#ffffff` | Muted alert backgrounds |
| `secondary-container` | `#e41f25` | Critical alerts |
| `on-secondary-container` | `#fffbff` | Alert text |
| `tertiary` | `#253648` | Muted dark indicators, accent boxes |
| `on-tertiary` | `#ffffff` | Tertiary text |
| `error` | `#ba1a1a` | Form validation error text |
| `on-error` | `#ffffff` | Text in error containers |
| `error-container` | `#ffdad6` | Form error background box |
| `on-error-container` | `#93000a` | Error icon color |
| `background` | `#f7f9fb` | HTML Body baseline color |
| `on-background` | `#191c1e` | Baseline text color |
| `surface-variant` | `#e0e3e5` | Muted card surfaces |

---

# 4. Typography

This design system utilizes **Inter** for its exceptional legibility in data-dense environments. 

The type scale emphasizes a clear hierarchy:
- **Headlines:** Use tighter letter-spacing and heavier weights to anchor page sections.
- **Body:** Set with generous line-heights to ensure educational content remains readable during long sessions.
- **Labels:** Utilized for data tables and status badges, often employing `uppercase` for small-scale clarity.

### Typography Specifications

| Category | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| `display-lg` | 48px | 700 (Bold) | 56px | -0.02em |
| `headline-lg` | 32px | 600 (Semibold) | 40px | -0.01em |
| `headline-md` | 24px | 600 (Semibold) | 32px | Normal |
| `body-lg` | 18px | 400 (Regular) | 28px | Normal |
| `body-md` | 16px | 400 (Regular) | 24px | Normal |
| `label-md` | 14px | 500 (Medium) | 20px | 0.01em |
| `label-sm` | 12px | 600 (Semibold) | 16px | 0.05em |

---

# 5. Layout & Spacing

The layout follows a **12-column fixed grid** for desktop, centered within a 1440px max-width container. 

A 8px linear scale governs all spatial relationships. Sidebars are fixed at 280px to maximize the workspace for data tables and charts. Dashboard modules should utilize "Stack" patterns (Vertical spacing) to maintain consistency:
- **8px (Stack Small - stack-sm):** Between labels and inputs.
- **16px (Stack Medium - stack-md):** Between related elements in a card.
- **32px (Stack Large - stack-lg):** Between distinct sections or major UI blocks.
- **Gutter:** 24px (gutter spacing for grid structures)
- **Margin Page:** 40px (base outer page padding)

---

# 6. Elevation & Depth

Hierarchy is established through **Tonal Layering** supplemented by **Ambient Shadows**.

- **Level 0 (Canvas):** The base background uses `#F8FAFC` (or surface `#f7f9fb`) to reduce eye strain.
- **Level 1 (Cards):** Pure white `#FFFFFF` surfaces with a very soft, diffused shadow (`0px 4px 20px rgba(27, 75, 138, 0.05)`). This "tinted shadow" keeps the UI feeling cohesive with the brand blue.
- **Level 2 (Overlays):** Modals, dropdowns, and context menus use a more pronounced shadow to indicate focus and physical separation from the workspace.
- **Borders:** Use a subtle `1px` stroke in `#E2E8F0` or `#c3c6d2` (`outline-variant`) for Level 1 containers to maintain crisp definition on high-resolution displays.

---

# 7. Shapes & Corner Radius

The shape language is "Approachable Professional."

- **Rounded LG (16px corner radius - rounded-lg):** Applied to all primary containers, charts, and card roots to soften the enterprise aesthetic.
- **Rounded MD (8px corner radius - rounded-md):** Used for interactive components like buttons, dropdown triggers, and input fields.
- **Rounded SM (4px corner radius - rounded-sm):** Used for minor highlights, tooltips, or sub-components.
- **Rounded Full (rounded-full):** Status badges and tags utilize a **full pill-shape** to distinguish them from actionable buttons.

---

# 8. Component Registry

| Component        | Version | Status |
| ---------------- | ------: | ------ |
| Button           |     1.0 | Stable |
| Card             |     1.0 | Stable |
| Table            |     1.0 | Stable |
| Dialog           |     1.0 | Stable |
| Chart            |     1.0 | Stable |
| Question Card    |     1.0 | Stable |
| Assessment Timer |     1.0 | Stable |
| Results Summary  |     1.0 | Stable |

Status values:
- Draft
- Experimental
- Stable
- Deprecated

---

# 9. Component Specifications & Behavior

### Interactive Charts & Progress Rings
- **Charts:** Use a refined color palette of Primary Blue, Teal, and Slate. Grid lines should be faint (`#F1F5F9` or `#eceef0`). Data points should have a 2px white stroke to pop against background fills.
- **Progress Rings:** Use a 12% opacity version of the stroke color for the "track." The "fill" should utilize a subtle vertical gradient.

### Data Tables
- **Header:** Light gray background (`#F1F5F9` or `#eceef0`) with `label-sm` typography.
- **Rows:** 56px minimum height, utilizing a subtle hover state (`#F8FAFC` or `#f2f4f6`). 
- **Dividers:** Horizontal lines only, using `#F1F5F9` or `#eceef0`.

### Cards
- **Padding:** 24px internal padding.
- **Header:** Includes a bottom border and specific slot for "Export" or "Filter" actions.

### Buttons & Inputs
- **Primary Button:** Deep Blue fill (`#00346b`) with white text (`#ffffff`).
- **Input Fields:** 1px border. On focus, the border transitions to Primary Blue with a 3px soft blue outer glow.
- **Status Badges:** Subtle background tints (e.g., Success: Light Green background with Dark Green text) with no borders.

---

# 10. Academic UX Standards

Standard academic components:
- Assessment Timer
- Question Navigator
- Reading Passage Viewer
- Writing Editor
- Listening Audio Player
- Speaking Recorder
- Answer Sheet
- Review Mode
- AI Feedback Card
- Readiness Prediction Widget
- Score Breakdown
- Progress Tracker

---

# 11. Component Behaviour (Generic)

Every interactive component documents:
- Purpose
- Anatomy
- Usage
- Accessibility
- States
- Validation
- Responsive behaviour

Supported states:
- Default
- Hover
- Focus
- Active
- Loading
- Disabled
- Error

---

# 12. Interaction Standards

Supported interactions:
- Click
- Keyboard shortcuts
- Drag & drop (where appropriate)
- Context menus
- Undo
- Confirmation before destructive actions

---

# 13. Loading Strategy

| Scenario             | Pattern       |
| -------------------- | ------------- |
| Initial load         | Skeleton      |
| Short request        | Spinner       |
| Long-running process | Progress bar  |
| Optimistic update    | Inline update |

---

# 14. Empty-State Library

Every empty state contains:
- Title
- Explanation
- Primary action
- Optional illustration

Standard empty states:
- No Assessments
- No Questions
- No Results
- No Notifications
- No Analytics

---

# 15. Notification Design

Notification categories:
- Success
- Information
- Warning
- Error
- Academic
- System

Each notification includes an icon, title, concise message and optional action.

---

# 16. Data Visualisation Palette

Supported formats:
- Line, Bar, Area, Pie, KPI Cards, Gauge.

Recommended palette:
1. `#00346b` (Primary Blue)
2. `#253648` (Tertiary Slate)
3. `#335e9e` (Accent Light Blue)
4. `#bb0014` (Highlight Red - alerts/high-priority only)

---

# 17. Theme Strategy

Current:
- Light Theme (Production)

Planned:
- Dark Theme
- High Contrast Theme

---

# 18. Accessibility

Target: **WCAG 2.2 AA**

Requirements:
- Keyboard navigation
- Screen-reader support
- Visible focus indicators
- ARIA where required
- Colour contrast compliance
- Semantic HTML

---

# 19. UX Writing

Use action-oriented labels:
- Start Assessment
- Continue Practice
- Submit Mock

Error messages explain:
- What happened
- Why
- How to recover

---

# 20. Design-to-Code Standards

Technology alignment:
- React
- Tailwind CSS
- Storybook
- CSS Variables
- Design Tokens

No inline styles.

---

# 21. Figma Governance

- Shared component library
- Shared variable library
- Standard page structure
- Component review before publication
- Version-controlled releases

---

# 22. Design QA Metrics

Targets:
- Lighthouse Accessibility: 100
- Performance: 95+
- CLS: <0.1
- Responsive verification complete
- Keyboard navigation verified

---

# 23. Release Baseline

| Component         | Version     |
| ----------------- | ----------- |
| Design System     | v3          |
| Brand Palette     | Clasptek    |
| Grid              | 12-column   |
| Typography        | Inter       |
| Accessibility     | WCAG 2.2 AA |
| Token Registry    | Enabled     |
| Component Library | Enabled     |
| Figma Governance  | Enabled     |

---

# Success Criteria

All interfaces across the Student Portal and Admin Portal use a shared Clasptek brand language, synchronized design tokens, governed components, accessible interaction patterns and consistent implementation across Figma, Tailwind CSS and React.
