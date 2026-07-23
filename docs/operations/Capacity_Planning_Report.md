# Clasptek Prep Portal V2 — Capacity Planning & Load Sizing Report

## Initial Production Sizing Targets

- **Registered Students**: 50,000 active accounts
- **Concurrent Active Users**: 5,000 peak concurrent students
- **Concurrent Mock Examinations**: 1,000 simultaneous test takers
- **API Latency Target**: $<300$ ms (p95)
- **Database Storage Growth**: ~10 GB / month
- **Media Asset Storage Growth**: ~50 GB / month

---

## Scaling Guidelines

1. **Next.js Web Tier**: Horizontal Pod Autoscaler (HPA) scaling between 3 and 10 container instances based on CPU ($>70\%$).
2. **PostgreSQL Database Tier**: Primary node (8 vCPU, 32 GB RAM) + 2 Read Replicas.
3. **Background Worker Tier**: Node worker container pool scaling dynamically based on evaluation queue backlog size ($>50$ items).
