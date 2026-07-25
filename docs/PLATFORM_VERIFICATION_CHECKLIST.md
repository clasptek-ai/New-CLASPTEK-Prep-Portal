# Platform Verification Checklist

## Clasptek Prep Portal V2 — Sprint Quality Gate

### Overview

This release checklist defines the mandatory Quality Gate required before any sprint or feature module is declared complete and ready for production deployment.

---

### Mandatory Verification Checklist

#### 1. Development Process & Ownership Rules

- [ ] Confirmed no background `next dev` process is running before invoking `npx next build`.
- [ ] Confirmed `.next` cache is purged ONLY after all Node/Next.js processes are fully terminated.

#### 2. Static Type Integrity

- [ ] `npx tsc --noEmit` passes with **0 errors**.

#### 3. Clean Production Build Compilation

- [ ] `npx next build` compiles 100% of static and dynamic routes cleanly with **0 Webpack errors** or React Client Manifest exceptions.

#### 4. Production Server Runtime (`next start`)

- [ ] `npx next start --port 3005` launches and reports `Ready`.
- [ ] `GET /_next/static/*` returns **HTTP 200 OK** with valid `text/css` and `application/javascript` MIME types.

#### 5. Development Server Runtime (`next dev`)

- [ ] `npx next dev --port 3000` compiles on demand without runtime `.call()` exceptions.

#### 6. Authentication & Session Security

- [ ] `GET /login` renders with full CSS styling and active controls.
- [ ] Authentication forms specify `method="POST"` explicitly.
- [ ] Submitting login credentials **never** exposes passwords or emails in URL query parameters (`/login?email=...`).
- [ ] `GET /api/v1/auth/session` returns **HTTP 401 Unauthorized** for unauthenticated requests and **HTTP 200 OK** for authenticated sessions with full Session DTO.

#### 7. Role-Based Access Control (RBAC) Security

- [ ] **Students** attempting to access `/admin/*` receive a branded **HTTP 403 Access Denied** page (no redirection loops).
- [ ] **Instructors** attempting to access `/admin/settings` or `/admin/system` receive **HTTP 403 Access Denied**.
- [ ] **Administrators** possess full access to Academic Operations Center modules.

#### 8. User Experience & Design System Integrity

- [ ] Responsive adaptability across Desktop, Laptop, Tablet, and Mobile drawer.
- [ ] Sidebar icons are clean and minimalist with **zero decorative pin/dot markers**.
- [ ] Active navigation is indicated by a subtle left accent bar and highlighted background.
- [ ] Light and Dark themes maintain consistent visual hierarchy using semantic tokens.
- [ ] WCAG AA accessibility compliance (keyboard navigation, focus rings, ARIA labels).

#### 9. Stability & Logs

- [ ] Zero hydration warnings in browser console.
- [ ] Zero unhandled promise rejections or server stack trace leaks.
