# Clasptek Prep Portal V2 — Incident Response Runbook

## Incident Severity Matrix

| Severity             | Definition                                      | Response Time | Escalation Pathway                    |
| :------------------- | :---------------------------------------------- | :------------ | :------------------------------------ |
| **Critical (Sev 1)** | Total platform outage or data corruption        | $<15$ minutes | Executive & Lead Architect Escalation |
| **High (Sev 2)**     | Key feature degraded (e.g. AI Evaluation delay) | $<30$ minutes | Senior SRE & Dev Lead                 |
| **Medium (Sev 3)**   | Minor non-blocking issue                        | $<4$ hours    | On-call Engineer                      |
| **Low (Sev 4)**      | Cosmetic or documentation bug                   | Next sprint   | Development Backlog                   |

---

## Escalation Workflow

```text
Alert Triggered / Issue Reported
              │
              ▼
   Triage Severity (Sev 1 - 4)
              │
   ┌──────────┴──────────┐
 Sev 1 / Sev 2         Sev 3 / Sev 4
   │                     │
 Engage Incident Commander  Log Ticket in Jira
   │
 Execute Rollback / Patch
   │
 Post-Mortem Report (within 48h)
```
