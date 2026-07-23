# AI Implementation & Autonomous Execution Rules

**Status**: Canonical Standard (Design Law)  
**Governance Scope**: All AI Coding Assistants & Autonomous Agents

---

## 1. Scope Enforcement & Zero Hallucination

- AI assistants SHALL ONLY create or modify files explicitly listed in the active implementation plan.
- AI assistants SHALL NOT create placeholder business features outside the current sprint scope.
- AI assistants SHALL NOT invent unapproved REST API endpoints or modify backend schemas.

## 2. Conflict Handling

If documentation conflicts with the existing backend codebase:

- **STOP** immediately.
- Report the exact mismatch to the user/lead engineer.
- Do NOT guess or substitute simpler architectural workarounds.
