---
name: Precision Academic Modernism
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#89ceff'
  on-secondary: '#00344d'
  secondary-container: '#00a2e6'
  on-secondary-container: '#00344e'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 3rem
    fontWeight: '800'
    lineHeight: '1.15'
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.65'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  timer-display:
    fontFamily: JetBrains Mono
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.02em
  metric-label:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-badge:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-stakes, distraction-free environment tailored for ambitious candidates preparing for rigorous standardized examinations (IELTS, SAT, CELPIP, TOEFL). The visual ethos fuses the authoritative gravitas of elite testing institutions with the ultra-responsive precision of developer-grade diagnostics. 

The aesthetic is **Precision Academic Modernism**—a disciplined hybrid of high-contrast minimalism and technical dashboard refinement. It rejects playful gamification in favor of calibrated credibility, mental clarity, and intense focus. The UI conveys calculated reassurance: tests are stressful, but the platform provides absolute control, surgical feedback, and unmistakable clarity under time pressure. Every container, border, and metric counter feels engineered to the millimeter.

## Colors

The system uses a targeted dual-zone visual architecture. The test administration and diagnostic engine operate on an immersive dark canvas (`#0B0F19` deep base, `#111827` secondary shell) to reduce eye fatigue during multi-hour timed sessions and preserve total focus. Individual question surfaces, answer options, and diagnostic cards transition into surgical crisp contrasts using `#FFFFFF` cards in light/hybrid review modes or elevated `#1E293B` containers within dark sessions.

- **Primary (`#4F46E5` Electric Indigo):** Anchors primary call-to-actions, active question selections, and high-level section progress.
- **Secondary (`#0EA5E9` Vivid Cyan/Teal):** Applied to active timing monitors, listening/audio waveforms, interactive text highlights, and informational markers.
- **Tertiary (`#10B981` Vibrant Emerald):** Communicates mastery, 99th percentile achievements, target band score attainment, and verified correct submissions.
- **Alert & Diagnostic Colors:**
  - **In-Progress / Cautionary:** `#F59E0B` (Warm Amber) for flagged-for-review prompts, low-time warnings (<5 minutes), and medium-confidence bands.
  - **Critical / Flagged Error:** `#EF4444` (Crimson) for diagnostic failure points, incorrect answer reveals, and expired test sections.
- **Exam-Specific Taxonomy Badges:**
  - **IELTS:** Rich Indigo tint (`rgba(79, 70, 229, 0.15)` bg / `#818CF8` text)
  - **SAT:** Cyan tint (`rgba(14, 165, 233, 0.15)` bg / `#38BDF8` text)
  - **CELPIP:** Teal tint (`rgba(20, 184, 166, 0.15)` bg / `#2DD4BF` text)
  - **TOEFL:** Violet tint (`rgba(139, 92, 246, 0.15)` bg / `#A78BFA` text)

## Typography

Typography balances rapid, high-speed comprehension with technical evaluation:

- **Primary Interface & Reading Passages (`Inter`):** Selected for its neutral character forms and dense paragraph legibility. In long SAT Reading or IELTS Academic passages, body text maintains strict line lengths of 60–75 characters and a line height of `1.65` to optimize sustained comprehension under fatigue.
- **Section Headers & Score Landmarks (`Plus Jakarta Sans`):** Delivers clean geometry with a razor-sharp modern profile, preventing visual monotony across diagnostic overview pages.
- **Diagnostics, Bands, and Live Clocks (`JetBrains Mono`):** Tabular figures (`tnum`) are mandatory. Time counters, percentile tables, band scores (e.g., `8.5 / 9.0`), and question index matrix items (`Q01` through `Q40`) must never jitter or shift column geometry during dynamic data streaming.

## Layout & Spacing

The layout is built on a rigid 8pt baseline grid configured around fixed structural constraints:

- **Assessment Workspace (Desktop / Tablet Split):** A 50/50 or 60/40 non-collapsing split panel. The left viewport pins the test passage or audio reference prompt; the right viewport houses the active question-card stack, navigation controls, and answer mechanisms. Both viewports possess independent custom scroll behavior.
- **Diagnostic Dashboard (Desktop):** A 12-column responsive layout with fixed maximum width (`1440px`), `1.5rem` gutters, and `2rem` outer margins.
- **Mobile Paradigm:** Collapses into a single vertical sequence. Reading passages tuck into a sticky, swipeable contextual top drawer, leaving the question card fully interactive within the immediate thumb-reach zone. Section timers and diagnostic status remain permanently pinned in a compact 44px top utility band.

## Elevation & Depth

Elevation is established using tonal layering paired with crisp hair-width boundary outlines rather than diffuse, floating drop-shadows.

1. **Base Layer (Canvas):** `#0B0F19` void background, ground plane for all modules.
2. **Structural Workspace Containers:** `#111827` surface with a `1px` stroke of `rgba(255, 255, 255, 0.08)`.
3. **Question & Analysis Cards (Active Elevation):** `#1E293B` (dark session) or `#FFFFFF` (diagnostic review mode). In dark mode, depth is articulated via an ultra-subtle directional gradient and a `1px` perimeter line tinted to `rgba(255, 255, 255, 0.12)`.
4. **Focused / Interactive Elements:** Active selection states trigger an ambient, tight glow: `0 0 0 1px #4F46E5, 0 4px 16px -2px rgba(79, 70, 229, 0.35)`.
5. **Floating Exam Clock & Action HUD:** Frosted backdrop filter (`backdrop-filter: blur(12px)`) with `rgba(15, 23, 42, 0.85)` surface fill, maintaining legibility regardless of scrolled text underneath.

## Shapes

The design system maintains a **Soft (`1`)** roundedness profile across the interface to reinforce structural discipline, geometric efficiency, and an academic software demeanor:

- **Base Components (Input fields, standard buttons, answer choice blocks):** `0.25rem` (4px).
- **Cards, Question Blocks, and Split Panes (`rounded-lg`):** `0.5rem` (8px).
- **Metric Modules and Floating HUDs (`rounded-xl`):** `0.75rem` (12px).
- **Exceptions (Pills):** Status indicator tags, test taxonomy chips (e.g., `[ IELTS ACADEMIC ]`), and question-jump dots maintain full border-radius for instant semantic separation from rectilinear content cards.

## Components

### Question Selection Cards & Multiple Choice
- Default state: Boxed container with `1px` border of `rgba(255, 255, 255, 0.1)`, `0.25rem` radius, `1rem` padding. Key letters (`A`, `B`, `C`, `D`) render in `JetBrains Mono` inside a dedicated square bounding badge (`32x32px`).
- Hover state: Border shifts to `#0EA5E9`, subtle background shift to `rgba(14, 165, 233, 0.04)`.
- Selected state: Border shifts to `#4F46E5`, background shifts to `rgba(79, 70, 229, 0.12)`, option indicator transitions to solid `#4F46E5` with crisp white glyph.
- Diagnostic Review state: Correct answers force a `#10B981` border with emerald badge; incorrect selections reveal a `#EF4444` border accompanied by an inline rubric breakdown box.

### Test HUD & Tabular Countdown Timers
- Rendered in a fixed top-right or sticky header layout.
- The clock uses `JetBrains Mono` with zero tabular spacing jitter.
- Critical threshold: When time drops below 05:00, digits switch from neutral cool-gray (`#94A3B8`) to pulsating Amber (`#F59E0B`); at under 01:00, digits switch to Crimson (`#EF4444`).

### Circular Band Score & Diagnostic Progress Rings
- SVG-based circular rings using concentric tracks with high-contrast color fills.
- Background track: `rgba(255, 255, 255, 0.06)`.
- Fill track: Gradients from `#4F46E5` to `#0EA5E9` (standard performance) or solid `#10B981` (target score hit). Center metric displays total Band Score (e.g., `8.5`) in `Plus Jakarta Sans` bold, flanked by the subscore breakdown.

### Test Type & Section Taxonomy Badges
- Micro-indicators rendered strictly in `label-badge` style (`0.6875rem`, uppercase, letter-spacing `0.08em`, monospaced).
- Features a semi-translucent tinted background paired with high-contrast foreground text, framed by a soft `1px` border matching the test type color.

### Action Controls & Buttons
- **Primary:** `#4F46E5` background, `#FFFFFF` text, `0.25rem` radius, subtle top inner-bevel (`inset 0 1px 0 rgba(255, 255, 255, 0.2)`). Micro-interaction: `scale(0.99)` on active press.
- **Secondary / Flag Question:** Outlined style with `1px` border (`rgba(255, 255, 255, 0.2)`), `#94A3B8` text, transitioning to `#F59E0B` icon accent when flagged.
- **System Inputs (Fill-in-the-Blank, Short Answer):** High-contrast mono-spaced input fields with a blinking `#0EA5E9` insertion caret, crisp bottom accent line, and instant grammar/length telemetry.