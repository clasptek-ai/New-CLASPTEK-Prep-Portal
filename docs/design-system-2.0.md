# Clasptek Prep Portal V2 — Enterprise Design System 2.0 Specification

**Version**: 2.0.0-RC1  
**Author**: Principal Product Design Architecture  
**Status**: Canonical Standard (Design Law)  
**Target Applications**: Student Portal, Instructor Workspace, Academic Authoring Studio, Platform Administration Console, Finance & Analytics Portal

---

## 1. Design Philosophy

Clasptek Prep Portal V2 represents an enterprise academic workspace engineered to bridge the precision of modern developer tools (Linear, Figma) with the analytical clarity of fintech infrastructure (Stripe Dashboard) and the human-centered learning dynamics of modern ed-tech (Coursera, Canvas LMS, DataCamp).

The design philosophy rests on three core pillars:

1. **Cognitive Ergonomics over Visual Noise**: Educational assessment environments demand high focus. UI elements must never compete with academic content, analytics charts, or exam diagnostic interfaces for the user's attention.
2. **Deterministic Layout Precision**: Every screen follows a rigid 8px baseline spatial grid and deterministic typography system. Layout shifts, inconsistent card padding, and ad-hoc color selection are prohibited.
3. **Enterprise Scalability & Resilience**: The design system is constructed from atomic design tokens to guarantee seamless multi-tenancy, light/dark theme parity, accessibility compliance (WCAG 2.1 AA), and multi-device adaptability for the next decade of platform growth.

---

## 2. Brand Personality

The visual identity of Clasptek balances academic rigor with cutting-edge technology:

- **Intellectual & Precise**: Clean geometric lines, crisp typography, and data-dense information layouts.
- **Empowering & Direct**: Action-oriented UX patterns that reduce time-to-value for students, instructors, and administrators.
- **Trustworthy & Authoritative**: Curated color palettes with high-contrast neutral backgrounds, muted slate surfaces, and vibrant semantic status indicators.
- **Modern & Sophisticated**: Subtle glassmorphism (`backdrop-filter: blur(12px)`), dark-mode-first aesthetic with rich glowing borders (`1px solid rgba(255,255,255,0.08)`), and fluid micro-interactions.

---

## 3. Visual Principles

1. **Clarity Over Decoration**: Avoid superficial gradients or non-functional visual flourishes. Every border, icon, and background fill communicates functional hierarchy.
2. **Hierarchy Over Clutter**: Establish strong visual ordering through typographic weight, color contrast, and elevation surfaces rather than arbitrary divider lines.
3. **Whitespace Over Density**: Use predictable spatial margins (`var(--spacing-16)`, `var(--spacing-24)`) to group related concepts and prevent cognitive overload.
4. **Consistency Over Creativity**: Re-use identical component patterns for identical user actions across all four primary portal workspaces.
5. **Accessibility Over Aesthetics**: Minimum 4.5:1 contrast ratio for all standard body text and 3:1 for large display elements. Keyboard focus rings (`2px solid #38bdf8`) are mandatory.
6. **Speed Over Complexity**: Micro-interactions must complete within `150ms - 200ms` using cubic-bezier easing (`cubic-bezier(0.16, 1, 0.3, 1)`).
7. **Professional Over Playful**: Use neutral, authoritative tone of voice and UI iconography (Lucide icon set).
8. **Minimal But Never Empty**: Empty states must offer actionable guidance, diagnostic context, and immediate recovery triggers.
9. **Pixel-Perfect Alignment**: Align all inline text, icons, actions, and form inputs to baseline grid ticks (`4px` / `8px`).
10. **10-Year Architecture**: Token-driven styling decoupled from specific CSS frameworks or runtime dependencies.

---

## 4. Color System

The Clasptek Color System uses HSL and RGB CSS custom properties to allow real-time theme adaptation and high-contrast accessibility.

### A. Dark Mode Tokens (Default Theme)

```css
:root[data-theme='dark'] {
  /* Canvas & Base Surfaces */
  --bg-app: #0b0f19; /* Deep Obsidian Slate */
  --bg-surface-0: #111827; /* Base Layer Container */
  --bg-surface-1: #151d30; /* Card & Modal Background */
  --bg-surface-2: #1e293b; /* Sub-card / Inset Panel */
  --bg-surface-hover: #26334d; /* Interactive Hover Fill */

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-default: #1e293b;
  --border-strong: #334155;
  --border-focus: #38bdf8;

  /* Typography Colors */
  --text-primary: #f8fafc; /* 100% Crisp White */
  --text-secondary: #cbd5e1; /* 80% Slate Neutral */
  --text-muted: #94a3b8; /* 60% Muted Slate */
  --text-disabled: #475569; /* Disabled Caption */

  /* Brand Accents */
  --primary-500: #3b82f6; /* Clasptek Cobalt Blue */
  --primary-600: #2563eb; /* Primary Active Button */
  --primary-glow: rgba(59, 130, 246, 0.25);

  --accent-pink: #ec4899; /* Platform Admin Accent */
  --accent-cyan: #06b6d4; /* AI Diagnostics Accent */
  --accent-purple: #a855f7; /* Authoring Studio Accent */

  /* Semantic Status Tokens */
  --success-bg: rgba(16, 185, 129, 0.12);
  --success-border: rgba(16, 185, 129, 0.35);
  --success-text: #34d399;

  --warning-bg: rgba(245, 158, 11, 0.12);
  --warning-border: rgba(245, 158, 11, 0.35);
  --warning-text: #fbbf24;

  --error-bg: rgba(239, 68, 68, 0.12);
  --error-border: rgba(239, 68, 68, 0.35);
  --error-text: #f87171;

  --info-bg: rgba(56, 189, 248, 0.12);
  --info-border: rgba(56, 189, 248, 0.35);
  --info-text: #38bdf8;
}
```

### B. Light Mode Tokens

```css
:root[data-theme='light'] {
  --bg-app: #f8fafc;
  --bg-surface-0: #ffffff;
  --bg-surface-1: #ffffff;
  --bg-surface-2: #f1f5f9;
  --bg-surface-hover: #e2e8f0;

  --border-subtle: #e2e8f0;
  --border-default: #cbd5e1;
  --border-strong: #94a3b8;
  --border-focus: #2563eb;

  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #64748b;
  --text-disabled: #94a3b8;

  --primary-500: #2563eb;
  --primary-600: #1d4ed8;
  --primary-glow: rgba(37, 99, 235, 0.15);

  --success-bg: #ecfdf5;
  --success-border: #a7f3d0;
  --success-text: #047857;

  --warning-bg: #fffbeb;
  --warning-border: #fde68a;
  --warning-text: #b45309;

  --error-bg: #fef2f2;
  --error-border: #fecaca;
  --error-text: #b91c1c;

  --info-bg: #f0f9ff;
  --info-border: #bae6fd;
  --info-text: #0369a1;
}
```

---

## 5. Typography System

The typography scale utilizes System Font Stacks (`Inter`, `SF Pro Display`, `Segoe UI`, `Roboto`, `sans-serif`) for optimal cross-platform rendering performance without font loading layout shifts. Monospace fonts (`JetBrains Mono`, `Fira Code`, `Consolas`) are strictly used for code blocks, JSON payloads, and metric digits.

| Token               | Size               | Line Height | Weight          | Letter Spacing | Target Usage                     |
| :------------------ | :----------------- | :---------- | :-------------- | :------------- | :------------------------------- |
| `font-display-hero` | `2.5rem` (40px)    | `1.15`      | 800 (Extrabold) | `-0.02em`      | Portal Landing Headers           |
| `font-display-lg`   | `2.0rem` (32px)    | `1.2`       | 800 (Extrabold) | `-0.015em`     | Main Workspace Banner Headers    |
| `font-heading-xl`   | `1.5rem` (24px)    | `1.25`      | 700 (Bold)      | `-0.01em`      | Section Titles, Modal Headers    |
| `font-heading-md`   | `1.25rem` (20px)   | `1.3`       | 700 (Bold)      | `0em`          | Card Group Titles                |
| `font-title-sm`     | `1.0rem` (16px)    | `1.4`       | 600 (Semibold)  | `0em`          | Table Headers, Card Labels       |
| `font-body-md`      | `0.875rem` (14px)  | `1.5`       | 400 (Regular)   | `0em`          | Standard Body Text, Form Inputs  |
| `font-body-sm`      | `0.8125rem` (13px) | `1.4`       | 400 (Regular)   | `0.01em`       | Secondary Descriptions           |
| `font-caption`      | `0.75rem` (12px)   | `1.4`       | 500 (Medium)    | `0.02em`       | Badges, Timestamp Meta           |
| `font-metric-num`   | `2.0rem` (32px)    | `1.0`       | 800 (Extrabold) | `-0.02em`      | KPI Stat Card Digits (Monospace) |

---

## 6. Spacing System (8px Grid)

All margins, paddings, gap layouts, and component dimensions must map to exact 4px/8px multiples.

```css
:root {
  --spacing-2: 2px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-64: 64px;
}
```

### Layout Boundary Guidelines

- **Card Padding**: `var(--spacing-20)` (Internal padding for standard KPI cards).
- **Form Row Gap**: `var(--spacing-16)` (Vertical gap between input fields).
- **Grid Layout Gap**: `var(--spacing-24)` (Column gap for dashboard card grids).
- **Section Vertical Margin**: `var(--spacing-32)` (Margin between page sections).

---

## 7. Grid System

- **Columns**: 12 Column Fluid Grid (`grid-template-columns: repeat(12, 1fr)`).
- **Container Max Width**: `1440px` (Main Application Layout).
- **Gutters**: `24px` desktop (`>1024px`), `16px` tablet (`768px - 1023px`), `12px` mobile (`<767px`).
- **Sidebar Width**: `260px` expanded, `64px` collapsed.

---

## 8. Component Library Inventory

Every reusable component in Clasptek V2 follows exact structural contracts.

### A. Cards

1. **Primary Card**: Standard surface container (`--bg-surface-1`) with subtle border (`--border-subtle`), rounded corners (`12px`), and top glow.
2. **Metric / KPI Card**: Displays single analytics KPI, trend badge (e.g. `+12% vs last week`), label, and optional sparkline chart.
3. **Insight / Diagnostic Card**: Dark glassmorphic card with colored status border (`left: 4px solid var(--info-border)`).
4. **Action Card**: Interactive card with hover translation (`translateY(-2px)`) and active ring highlight.

### B. Form Controls

1. **Text / Password Input**: Height `40px`, border-radius `8px`, background `--bg-surface-0`, text color `--text-primary`. Focus state triggers `2px solid var(--border-focus)` outline.
2. **Select & Multi-Select**: Custom styled popover menu (`--bg-surface-1`), dark checkmark indicator, search filter header.
3. **Toggle Switch**: `44px x 24px` track width, `20px` inner thumb, 150ms smooth transition.

### C. Buttons

1. **Primary**: Background `--primary-600`, text `#ffffff`, hover `--primary-500`, active scale `0.98`.
2. **Secondary**: Background `--bg-surface-2`, text `--text-primary`, border `--border-default`.
3. **Ghost**: Background `transparent`, text `--text-secondary`, hover `--bg-surface-hover`.
4. **Danger**: Background `--error-bg`, border `--error-border`, text `--error-text`.

### D. Data Tables

- **Header**: Sticky top (`top: 0`), uppercase caption typography (`11px`), background `--bg-surface-0`.
- **Row**: Height `48px`, hover background `--bg-surface-hover`, bottom border `--border-subtle`.
- **Bulk Action Bar**: Floating bottom bar (`position: fixed; bottom: 24px; left: 50%`) with selected count and quick actions.

---

## 9. Layout Rules

Each workspace follows strict structural zoning:

```
+-----------------------------------------------------------------------------------+
| Top Header Navigation (Search, Workspace Switcher, Notifications, User Profile)   |
+-------------------+---------------------------------------------------------------+
| Sidebar Nav       | Main Content Workspace Scroll Region                          |
|                   | +-----------------------------------------------------------+ |
| • Dashboard       | | Breadcrumb Trail / Page Title / Action Header Toolbar     | |
| • Practice        | +-----------------------------------------------------------+ |
| • Assessments     | | Top Alert Interventions / Banner Notices                  | |
| • Readiness       | +-----------------------------------------------------------+ |
| • Analytics       | | Metric Cards Grid (4 columns desktop, 2 tablet, 1 mobile) | |
| • Settings        | +-----------------------------------------------------------+ |
|                   | | Primary Operational Content (Data Tables, Editors, Charts)| |
|                   | +-----------------------------------------------------------+ |
+-------------------+---------------------------------------------------------------+
```

---

## 10. Interaction Guidelines

- **Hover States**: All interactive cards and buttons transition background color and border over `150ms ease-out`.
- **Focus Rings**: Accessible focus ring (`outline: 2px solid #38bdf8; outline-offset: 2px`) automatically rendered for keyboard navigation (`:focus-visible`).
- **Active / Pressed**: Buttons scale down slightly (`transform: scale(0.98)`) on mouse click/touch.
- **Disabled State**: Opacity reduced to `0.5`, `cursor: not-allowed`, pointer events suppressed.

---

## 11. Motion Guidelines

Motion must be functional, subtle, and non-distracting.

- **Fast Micro-interactions (Badges, Buttons, Tooltips)**: `150ms cubic-bezier(0.16, 1, 0.3, 1)`.
- **Medium Transitions (Modals, Drawers, Accordions)**: `250ms cubic-bezier(0.16, 1, 0.3, 1)`.
- **Complex Page Route Transitions**: `300ms ease-in-out`.
- **Reduced Motion**: Respect `prefers-reduced-motion: reduce` by disabling non-essential transform animations.

---

## 12. Accessibility Standards (WCAG 2.1 AA)

- **Color Contrast**: All text vs background pairs maintain minimum 4.5:1 contrast.
- **Keyboard Navigation**: Complete tab order (`tabIndex=0`) across all interactive widgets, buttons, modal focus traps, and dropdowns.
- **Screen Reader Support**: All icons maintain `aria-hidden="true"`, buttons specify `aria-label`, dynamic regions use `aria-live="polite"`.

---

## 13. Responsive Breakpoints

| Breakpoint Name | Min Width | Max Width | Target Layout Adjustments                                   |
| :-------------- | :-------- | :-------- | :---------------------------------------------------------- |
| `xs`            | `0px`     | `639px`   | Mobile (Stacked cards, drawer navigation, 1 column grid)    |
| `sm`            | `640px`   | `767px`   | Mobile Large (2 column KPI grid)                            |
| `md`            | `768px`   | `1023px`  | Tablet (Collapsed sidebar, 2 column content layout)         |
| `lg`            | `1024px`  | `1279px`  | Desktop Small (Expanded sidebar, 3 column KPI grid)         |
| `xl`            | `1280px`  | `1535px`  | Desktop Standard (Full 4 column KPI grid, 12 column layout) |
| `2xl`           | `1536px`  | `∞`       | Ultra-wide (Max container width 1440px centered)            |

---

## 14. Design Tokens Mapping (JSON Schema)

```json
{
  "color": {
    "background": {
      "app": { "value": "var(--bg-app)" },
      "surface": { "value": "var(--bg-surface-1)" }
    },
    "text": {
      "primary": { "value": "var(--text-primary)" },
      "secondary": { "value": "var(--text-secondary)" },
      "muted": { "value": "var(--text-muted)" }
    },
    "brand": {
      "primary": { "value": "var(--primary-500)" },
      "glow": { "value": "var(--primary-glow)" }
    }
  },
  "space": {
    "xs": { "value": "4px" },
    "sm": { "value": "8px" },
    "md": { "value": "16px" },
    "lg": { "value": "24px" },
    "xl": { "value": "32px" }
  },
  "radii": {
    "sm": { "value": "6px" },
    "md": { "value": "8px" },
    "lg": { "value": "12px" },
    "full": { "value": "9999px" }
  }
}
```

---

## 15. Component Naming Conventions

All components and CSS classes follow BEM / PascalCase React standards:

- **React Components**: `Card`, `MetricCard`, `DataTable`, `Button`, `Badge`, `SkeletonLoader`.
- **CSS Utility Classes**: `c-card`, `c-card--metric`, `c-button`, `c-button--primary`, `c-badge--success`.
- **Design Tokens**: `--[category]-[subcategory]-[variant]-[state]` (e.g. `--bg-surface-hover`, `--text-primary`).

---

## 16. Figma Structure Recommendation

```
📁 Clasptek Design System 2.0 (Figma File)
 ├── 📄 01. Foundations (Color Tokens, Type Scale, Elevation, Spacing Grid)
 ├── 📄 02. Primitives (Buttons, Inputs, Toggles, Badges, Tooltips)
 ├── 📄 03. Molecule Components (Metric Cards, Form Groups, Notification Toasts)
 ├── 📄 04. Organisms (Enterprise Data Tables, Sidebars, Header Navigation)
 ├── 📄 05. Workspace Templates (Student, Admin, Instructor, Authoring)
 └── 📄 06. Page Screens (Dashboard, Practice, Mock Exam, Analytics)
```

---

## 17. Tailwind Token Mapping (`tailwind.config.js`)

```javascript
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-app)',
        surface: {
          DEFAULT: 'var(--bg-surface-1)',
          subtle: 'var(--bg-surface-0)',
          hover: 'var(--bg-surface-hover)',
        },
        primary: {
          DEFAULT: 'var(--primary-500)',
          active: 'var(--primary-600)',
        },
        border: 'var(--border-default)',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
      },
    },
  },
};
```

---

## 18. shadcn/ui Mapping

- `Button` -> Mapped to `@clasptek/ui` `Button` with `--primary-600` fill and active scale transitions.
- `Card` -> Mapped to `@clasptek/ui` `Card` with `--bg-surface-1` background and `--border-subtle` border.
- `Dialog` -> Mapped to `@clasptek/ui` `Modal` with backdrop blur (`backdrop-filter: blur(8px)`).
- `Table` -> Mapped to `@clasptek/ui` `EnterpriseDataTable` with sticky header and bottom pagination controls.

---

## 19. Future Expansion Strategy

1. **AI Assistant Floating Palette**: Standardized bottom-right floating trigger (`fixed bottom-6 right-6`) with expandable glassmorphic drawer.
2. **Multi-Tenant White Labeling**: Support custom brand primary accents by dynamically overriding `--primary-500` and `--primary-glow` via tenant CSS variables.
3. **Offline Diagnostic Sync Indicator**: System tray status badge indicating offline queue depth and automatic sync triggers.

---

## 20. Governance Rules

1. **Zero Ad-hoc Inline Colors**: Hardcoded color hex codes (`#123456`) in JSX components are strictly rejected during code review. All colors must reference CSS tokens (`var(--...)`).
2. **Zero Non-Standard Spacing**: Inline margins or paddings that do not map to `4px`/`8px` grid steps are prohibited.
3. **Mandatory Typecheck & Lint Compliance**: Component modifications must pass `pnpm typecheck` and `pnpm lint` without warnings before pull request approval.
