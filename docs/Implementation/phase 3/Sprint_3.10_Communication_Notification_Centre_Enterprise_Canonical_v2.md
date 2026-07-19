# Clasptek Prep Portal V2

# Sprint 3.10 — Communication & Notification Centre

# Enterprise Canonical Implementation Specification

**Document Version:** 2.0.0  
**Target Model:** GPT-5.5  
**Release Tag:** `v3.13.1-communication-notification-centre`

---

# Goal

Implement a centralized Communication & Notification Centre that delivers governed, event-driven communications across the Clasptek Prep Portal while remaining channel-independent, auditable and scalable.

---

# Architecture

```text
Assessment
Practice
Mock
AI Evaluation
Academic Progress
Learning Analytics
        │
Notification Centre
        ├── Notification Domain
        ├── Announcement Domain
        ├── Channel Registry
        └── Delivery Engine
              │
Student Dashboard
Admin Portal
```

---

# Domain Packages

## packages/domain/notification

Owns:

- Personal notifications
- User inbox
- Preferences
- Delivery tracking

## packages/domain/announcement

Owns:

- Broadcast announcements
- Expiry rules
- Audience targeting
- Publication lifecycle

---

# Database

## Migrations

- 00270_notifications.sql
- 00271_notification_templates.sql
- 00272_notification_preferences.sql
- 00273_notification_history.sql
- 00274_notification_queue.sql
- 00275_notification_rls.sql

## Tables

- notifications
- notification_templates
- notification_versions
- notification_queue
- notification_history
- notification_channels
- announcements
- broadcasts
- notification_audit

---

# Notification Lifecycle Policy

```text
Created
   ↓
Queued
   ↓
Processing
   ├────────► Delivered
   └────────► Failed
                  │
                  ▼
                Retry
                  │
                  ▼
              Delivered
                  │
                  ▼
                 Read
                  │
                  ▼
               Archived
```

---

# Channel Registry

Supported channels:

- In-App (implemented)
- Email (future)
- SMS (future)
- WhatsApp (future)
- Push (future)

Channel selection is configuration-driven.

---

# Notification Priorities

| Priority | Example             |
| -------- | ------------------- |
| Critical | Security Alert      |
| High     | Mock Available      |
| Normal   | Assessment Unlocked |
| Low      | Weekly Reminder     |

---

# Delivery Policies

Support:

- Immediate
- Scheduled
- Daily Digest
- Weekly Digest

---

# Retry Policy

Configure:

- Maximum retries
- Retry interval
- Dead-letter queue
- Permanent failure state

---

# Notification Categories

- Academic
- System
- Achievement
- Security
- Administration
- Marketing (future)

---

# Template Registry & Versioning

Each template stores:

- Template ID
- Template Version
- Variables
- Language
- Created Date
- Status

Historical notifications retain the template version used.

---

# User Preference Profiles

Profiles include:

- Academic Only
- Everything
- Announcements Only
- Minimal

Users may customise category subscriptions.

---

# Admin Operations Dashboard

Display:

- Pending
- Processing
- Delivered
- Failed
- Retry Queue
- Queue Length
- Delivery Time
- Channel Health

---

# Communication Analytics

Track:

- Delivery Rate
- Read Rate
- Announcement Reach
- Average Read Time
- Failed Deliveries
- Queue Throughput
- Channel Utilisation

---

# Notification Audit Model

Audit events:

- Created
- Queued
- Processing
- Delivered
- Read
- Archived
- Failed
- Retried
- Cancelled

---

# REST APIs

- GET /api/v1/notifications
- PATCH /api/v1/notifications/{id}/read
- GET /api/v1/announcements
- POST /api/v1/broadcasts
- GET /api/v1/preferences
- PATCH /api/v1/preferences

---

# Security

- Authentication
- Role-Based Authorization
- Row-Level Security
- Broadcast Permissions
- Audit Logging
- Data Validation

---

# Testing

- Domain Tests
- Queue Tests
- Broadcast Tests
- Template Versioning Tests
- Preference Tests
- API Tests
- Security Tests
- Regression Tests

Coverage Targets:

- Domain 100%
- Application 90%
- Persistence 85%

Run:

```bash
pnpm verify
```

---

# Release Readiness Certificate

| Item                  | Status |
| --------------------- | ------ |
| Architecture          | ✓      |
| Notification Domain   | ✓      |
| Announcement Domain   | ✓      |
| Queue                 | ✓      |
| Delivery Engine       | ✓      |
| Templates             | ✓      |
| Security              | ✓      |
| Testing               | ✓      |
| Ready for Sprint 3.11 | ✓      |

---

# Deliverables

- Notification Domain
- Announcement Domain
- Channel Registry
- Delivery Engine
- Student Inbox
- Admin Broadcast Centre
- Communication Analytics
- Template Registry
- Preference Profiles
- REST APIs
- Automated Tests
- Updated Documentation

---

# Success Criteria

The platform provides a robust, event-driven communication platform with governed notification lifecycles, reusable versioned templates, configurable delivery policies, comprehensive auditing, operational analytics and a scalable channel abstraction while keeping notifications and announcements as distinct bounded contexts.
