# ADR-020: Administration Console Architecture

## Status
Accepted

## Context
Phase 4 requires a platform-wide Administration Console for managing multi-tenant settings, auditing security logs, and managing RBAC permission matrices. To protect superuser operations, we need clear routing and component rules.

## Decision
1. **Isolated Pathing Route**: Enforce all administrative routes under `/admin/` (e.g. `/admin/users/[userId]`).
2. **Environment Scope Banners**: Display explicit high-contrast environment tags (`STAGING/PRODUCTION`) in layout headers to prevent configuration mistakes.
3. **Pluggable System Health Widgets**: Standardise metrics cards to track latency indicators over time instead of single spikes.

## Consequences
- Clean separation of platform operations from curriculum editing.
- Dynamic matrix checkboxes map privileges checks easily.
