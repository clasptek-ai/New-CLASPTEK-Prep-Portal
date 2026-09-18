---
name: Academic Rigor
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434653'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737784'
  outline-variant: '#c3c6d5'
  surface-tint: '#1d59c1'
  primary: '#003c90'
  on-primary: '#ffffff'
  primary-container: '#0f52ba'
  on-primary-container: '#bcceff'
  inverse-primary: '#b0c6ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#3a4249'
  on-tertiary: '#ffffff'
  tertiary-container: '#525960'
  on-tertiary-container: '#c8cfd8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#00419c'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#dce3ec'
  tertiary-fixed-dim: '#c0c7d0'
  on-tertiary-fixed: '#151c23'
  on-tertiary-fixed-variant: '#40484f'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-reading:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  timer-display:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-stakes, distraction-free environment for international standardized test preparation (IELTS, SAT, TOEFL, CELPIP). It merges the quiet authority of premier academic testing centers with the refined ergonomic precision of modern enterprise software.

### Personality & Emotional Tenor
- **Rigorous & Composed:** Clear cognitive hierarchy removes anxiety without feeling clinical or sterile.
- **Institutional Authority:** Built on deep navy tones and deliberate structure, conveying trust, institutional prestige, and high educational standards.
- **Cognitive Clarity:** The visual hierarchy prioritizes reading endurance, rapid assessment comprehension, and prolonged focus under timed conditions.

### Design Movement: Modern Academic Enterprise
The visual aesthetic avoids trends such as heavy glassmorphism, aggressive gradients, decorative skeuomorphism, or juvenile gamification. Instead, it relies on:
- Razor-sharp typographic scales with calibrated tabular figures for test-taking and analytics.
- Structured card containment using micro-borders (`1px`) over floating drop shadows.
- Generous, disciplined whitespace that separates complex multi-part prompts, audio playback components, and passage evaluation modules.

## Colors

The palette is tuned for high-contrast accessibility (WCAG AAA for text passages, WCAG AA minimum for interactive states) and sustained focus over multi-hour simulation exams.

### Core Roles
- **Primary (`#0F52BA` - Sapphire Clasptek Blue):** Applied intentionally to primary calls-to-action, section progress tracking, active answer option markers, and verified analytical badges.
- **Secondary (`#1E293B` - Deep Slate Navy):** Anchors secondary actions, data table headers, navigation bars, and test module selectors.
- **Tertiary / Interactive Neutral (`#EFF6FF` - Ice Blue):** Backing fill for active question choices, passage highlights, active tab states, and focused assessment panels. Paired with an edge border of `#DBEAFE`.
- **Neutral Surface & Text (`#0F172A` / `#FFFFFF` / `#F8FAFC`):**
  - `#0F172A`: High-contrast body typography, section titles, and strict prompt headers.
  - `#475569`: Subordinate test directions, meta labels, and descriptive captions.
  - `#FFFFFF`: Primary card, reading prompt, and answer container fill.
  - `#F8FAFC` & `#F1F5F9`: Global canvas canvas backing, sidebar rails, and inactive container fills.
  - `#E2E8F0`: Universal 1px structural boundary line across all elements.

### Critical Alert & Functional Colors
- **Restrained Alert Red (`#DC2626`):** Strictly sequestered. Used exclusively for countdown timers under 2 minutes, unrecoverable section submission warnings, and proctoring/tab-switch infringement flags. It is never used for generic branding.
- **Affirmative Green (`#16A34A`):** Used strictly in post-exam scoring diagnostic reviews, correct response indicators, and completed module milestones.

## Typography

Typography is set exclusively in **Inter** to ensure maximum legibility across dense linguistic passages, complex question prompts, and numerical analytics.

### Typographic Hierarchy Rules
- **Passage Reading (`body-reading`):** Configured at 17px with a 28px line height. This accommodates multi-paragraph comprehension texts (IELTS Reading, TOEFL Academic passages), maintaining optimal character counts per line (65–75 CPL) and preventing eye strain.
- **Tabular Numerics:** Enable `font-feature-settings: "tnum"` for `timer-display`, question indexes, and score matrices to prevent layout shifting during real-time test execution.
- **Headlines:** Clean, low-tracking geometric weights provide immediate structural grounding for section transitions, mock test titles, and test section summaries.

## Layout & Spacing

The layout is architected around a strict 8pt base grid system to reflect clean desktop-first testing environments while adapting gracefully to tablet and mobile reviews.

### Grid Infrastructure
- **Assessment Split View (Desktop):** A dual-pane split view (50/50 or 55/45) with independent scroll architectures. Left pane: immutable source text, audio playback, or stimulus material. Right pane: interactive questions, prompt submissions, or response radios.
- **Portal Dashboard:** 12-column fluid grid bound to a max-width of `1440px` with `margin: 2rem` and `gutter: 1.5rem`.
- **Breakpoints:**
  - **Desktop (`>= 1280px`):** Dual-column independent scroll layout for tests. Fixed utility top bar displaying current section, question map, and timer.
  - **Tablet (`768px - 1279px`):** Single column with floating bottom drawer or top-tab toggle between stimulus passage and question list.
  - **Mobile (`< 768px`):** Sequential stacking optimized for flashcards, vocabulary drills, and score reviews. Full test simulation mode prompts users to utilize desktop viewports.

## Elevation & Depth

Visual hierarchy uses **low-contrast outlines** paired with subtle, micro-depth layering. Heavy drop shadows and glass surfaces are strictly avoided to prevent visual fatigue and interface latency.

### Surface Tiers
- **Base Canvas (Level 0):** `#F8FAFC`. Background for application frames, global layout bars, and portal footers.
- **Card & Workspace Surface (Level 1):** `#FFFFFF` paired with a crisp `1px solid #E2E8F0` boundary border. Used for all reading prompts, answer cards, and diagnostic tables.
- **Focused & Interactive Surface (Level 2):** `#EFF6FF` paired with a `1px solid #93C5FD` border and a subtle ambient anchor: `0 1px 3px 0 rgba(15, 23, 42, 0.05)`. Used for chosen answers, active question inputs, and selected filter badges.
- **Overlay & Popover Surface (Level 3):** `#FFFFFF` with `1px solid #CBD5E1` and a disciplined shadow: `0 8px 16px -4px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`. Applied solely to question navigator palettes, timer dropdowns, and vocabulary definition tooltips.

## Shapes

The design uses a clean, geometric corner system (`roundedness: 1`). Radii are tightly controlled between 4px and 8px:
- **Inner Controls (Buttons, Inputs, Options, Badges):** Fixed at `6px` (`0.375rem`) to maintain architectural rigor.
- **Surrounding Cards, Modals, & Panels:** Fixed at `8px` (`0.5rem`).
- **Data Indicator Pills & Question Palette Circles:** Fully circular (`rounded-full`) exclusively when representing question numbers (e.g., Question 1 through 40 index nodes) or status dots.
- Roundedness never exceeds `8px` on rectilinear containers, reinforcing a professional, enterprise-grade feel.

## Components

### Buttons
- **Primary:** `#0F52BA` solid fill, `#FFFFFF` Inter label (Semi-Bold), 6px border radius, height 40px (padding: 0 1.25rem). Hover: `#1D4ED8`. Active: `#1E40AF`. Focus: 2px ring `#0F52BA` with 2px white offset.
- **Secondary:** `#FFFFFF` fill, `1px solid #CBD5E1`, text `#1E293B`. Hover: `#F8FAFC` with border `#94A3B8`.
- **Destructive/Critical:** `#FFFFFF` fill, `1px solid #DC2626`, text `#DC2626`. Used only for "End Exam", "Leave Simulation", or destructive overrides.

### Option Selection Cards (Multiple Choice & True/False/Not Given)
- Default: `#FFFFFF` surface, `1px solid #E2E8F0`, 6px radius, padding 1rem. Letter prefix indicator (A, B, C, D) housed in a crisp 28px square with `#F1F5F9` background, `#475569` text.
- Selected State: Background shifts to `#EFF6FF`, border shifts to `#0F52BA`, letter prefix turns `#0F52BA` on `#DBEAFE`.
- Key Requirement: Smooth transition without structural layout shift; cursor is `pointer` across the entire bounding box.

### Input Fields & Writing Modules
- Height 40px for single-line inputs, clean auto-expanding textarea for IELTS Task 1/2 and TOEFL Independent Writing.
- Base: `1px solid #CBD5E1` on `#FFFFFF` fill, text `#0F172A`, placeholder `#94A3B8`.
- Focus: `border-color: #0F52BA`, `outline: none`, `box-shadow: 0 0 0 1px #0F52BA`.
- Live word counter utility attached to bottom-right boundary in `label-sm` using `#64748B`.

### Question Navigator Grid
- A matrix of 40 numerical tiles representing the exam blueprint.
- Dimensions: 32px x 32px per unit, rounded-sm (4px).
- States:
  - *Unanswered:* `#FFFFFF`, border `#E2E8F0`, text `#64748B`.
  - *Answered:* `#1E293B`, text `#FFFFFF`.
  - *Current / In-View:* Ring 2px `#0F52BA` offset 1px.
  - *Flagged for Review:* Triangular corner notch marker in `#D97706`.

### Timer Component
- Pinned to the exam header. Font family: Inter Tabular Figures.
- Normal state (> 2 min remaining): `#F1F5F9` pill container, `#1E293B` text, stopwatch vector in `#475569`.
- Critical state (< 2 min remaining): Container switches to `#FEF2F2`, border to `#FCA5A5`, text and icon to `#DC2626` with a gentle 1-second pulse animation.