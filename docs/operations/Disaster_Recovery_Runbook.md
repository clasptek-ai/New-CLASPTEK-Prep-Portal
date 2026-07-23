# Clasptek Prep Portal V2 — Disaster Recovery Runbook

**Document Version:** 1.0.0  
**Target RPO:** $<15$ minutes  
**Target RTO:** $<1$ hour

---

## 1. Backup Schedule & Strategy

- **Full Database Snapshots**: Daily at 02:00 UTC via `scripts/backup-db.js`.
- **WAL Archives**: Continuous Write-Ahead Log archiving to encrypted S3 storage.
- **Retention Period**: 30 days point-in-time recovery (PITR).

---

## 2. Disaster Recovery Restoration Procedure

### Step 1: Declare Disaster Event

Contact SRE Lead and Operations Lead. Transition DNS traffic to maintenance fallback page.

### Step 2: Database Restoration

```bash
# Execute point-in-time recovery to standby PostgreSQL node
pg_restore -U clasptek_prod -d clasptek_prod database/backups/latest_snapshot.sql
```

### Step 3: Health Probe Verification

```bash
# Verify system liveness probe
curl -f http://localhost:3000/api/v1/health
```

### Step 4: Resume Traffic Cutover

Execute Blue-Green deployment cutover to point traffic back to active cluster.
