# Clasptek Prep Portal V2

# RBAC Permission Matrix

# Enterprise Canonical Authorization Specification

**Document Version:** 2.0.0  
**Baseline ID:** `rbac-permission-matrix-v2`

---

# Purpose

This document is the authoritative authorization specification for Clasptek Prep Portal V2. It defines roles, permissions, ownership, authorization policies, scopes, governance, testing requirements and security boundaries.

---

# Authorization Principles

- Least privilege
- Deny by default
- Explicit permission assignment
- Row-Level Security (RLS)
- Domain ownership
- Auditable authorization decisions
- No implicit role inheritance

---

# System Roles

| Role                   | Managed By              |
| ---------------------- | ----------------------- |
| Guest                  | Identity Domain         |
| Student                | Identity Domain         |
| Facilitator            | Academic Administration |
| Academic Administrator | System Administration   |
| System Administrator   | Super Administrator     |
| Super Administrator    | Platform Owner          |

---

# Permission Registry

| Permission                 | Description                  |
| -------------------------- | ---------------------------- |
| assessment:start           | Start assessment             |
| assessment:submit          | Submit assessment            |
| assessment:publish         | Publish assessment           |
| question:create            | Create question              |
| question:update            | Update question              |
| question:bulk_upload       | Bulk upload questions        |
| question:bulk_publish      | Bulk publish questions       |
| analytics:view:own         | View personal analytics      |
| analytics:view:institution | View institutional analytics |
| notification:broadcast     | Broadcast announcements      |
| user:manage                | Manage users                 |
| role:manage                | Manage roles                 |

---

# Resource-Based Permission Matrix

## Identity

- profile:view
- profile:update

## Question Bank

- question:view
- question:create
- question:update
- question:delete
- question:bulk_upload
- question:bulk_publish

## Assessment

- assessment:start
- assessment:submit
- assessment:view
- assessment:publish

## Practice

- practice:start
- practice:submit
- practice:view

## Mock

- mock:start
- mock:submit
- mock:view

## AI Evaluation

- evaluation:view
- evaluation:review
- evaluation:retry

## Academic Progress

- results:view:own
- results:view:all
- progress:view

## Learning Analytics

- analytics:view:own
- analytics:view:institution

## Notifications

- notification:view
- notification:broadcast

---

# Core Role Matrix

| Capability              | Student | Facilitator | Academic Admin | System Admin | Super Admin |
| ----------------------- | :-----: | :---------: | :------------: | :----------: | :---------: |
| Assessment              |    ✓    |      ✓      |       ✓        |      ✓       |      ✓      |
| Practice                |    ✓    |      ✓      |       ✓        |      ✓       |      ✓      |
| Mock                    |    ✓    |      ✓      |       ✓        |      ✓       |      ✓      |
| Question Management     |         |      ✓      |       ✓        |      ✓       |      ✓      |
| Bulk Publish            |         |             |       ✓        |      ✓       |      ✓      |
| AI Review               |         |      ✓      |       ✓        |      ✓       |      ✓      |
| Institutional Analytics |         |             |       ✓        |      ✓       |      ✓      |
| User Management         |         |             |                |      ✓       |      ✓      |
| Platform Settings       |         |             |                |      ✓       |      ✓      |
| Override Permissions    |         |             |                |              |      ✓      |

---

# Permission Scope

Examples:

- results:view:own
- results:view:all
- analytics:view:own
- analytics:view:institution

---

# Permission Inheritance Policy

- No implicit inheritance
- Explicit assignment only
- Composite roles must be documented and approved

---

# Temporary Permissions

Support temporary elevation with:

- Permission
- Assigned To
- Start Time
- End Time
- Approver
- Business Justification

Permissions expire automatically.

---

# Delegation Policy

Delegation is allowed only where approved.

Delegated permissions:

- Are time-bound
- Are auditable
- Cannot exceed delegator privileges

---

# Separation of Duties (SoD)

The following combinations should not normally be assigned to the same user:

- Question Create + Question Approve
- Bulk Upload + Final Publish
- Role Management + Role Audit
- System Administration + Security Audit

---

# Authorization Decision Matrix

| Condition                        | Result |
| -------------------------------- | ------ |
| Authenticated + Permission + RLS | Allow  |
| Authenticated + No Permission    | Deny   |
| Unauthenticated                  | Deny   |
| Permission Granted + RLS Failed  | Deny   |

---

# API Permission Mapping

| Endpoint                      | Permission             |
| ----------------------------- | ---------------------- |
| POST /questions               | question:create        |
| POST /questions/bulk-upload   | question:bulk_upload   |
| POST /questions/bulk-publish  | question:bulk_publish  |
| POST /assessments/start       | assessment:start       |
| POST /assessments/{id}/submit | assessment:submit      |
| POST /broadcasts              | notification:broadcast |

---

# Domain Ownership

| Domain            | Permission Group |
| ----------------- | ---------------- |
| Identity          | profile:*        |
| Question Bank     | question:*       |
| Assessment        | assessment:*     |
| Practice          | practice:*       |
| Mock              | mock:*           |
| AI Evaluation     | evaluation:*     |
| Academic Progress | results:*        |
| Analytics         | analytics:*      |
| Notifications     | notification:*   |

---

# Authorization Flow

Request → Authentication → Role Resolution → Permission Check → RLS Enforcement → Business Rules → Allow / Deny

---

# Permission Lifecycle

Draft → Approved → Active → Deprecated → Removed

---

# Authorization Testing Strategy

- Positive authorization tests
- Negative authorization tests
- RLS validation
- Privilege escalation tests
- API permission tests
- Temporary permission expiry tests

---

# Audit Requirements

Audit:

- Authentication
- Role assignments
- Permission changes
- Temporary permissions
- Delegations
- Administrative actions
- Broadcasts

---

# Governance Rules

- Every protected API maps to a permission
- Every permission belongs to one domain
- Every new feature defines permissions before implementation
- Every new table includes RLS policies

---

# Release Baseline

| Component            | Version |
| -------------------- | ------- |
| RBAC                 | v2      |
| Permission Registry  | v1      |
| RLS                  | Enabled |
| Authorization Policy | Active  |
| Audit Logging        | Enabled |

---

# Success Criteria

The platform enforces consistent, least-privilege authorization through a governed RBAC model with explicit permissions, resource-based access control, RLS enforcement, auditable decisions, and standardized authorization policies across every bounded context.
