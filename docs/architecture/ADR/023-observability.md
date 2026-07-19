# ADR-023: Observability & Operational Intelligence Platform

## Status
Accepted

## Context
Platform facilitators and Operations managers need to monitor API error rates, background workers queue latency averages, database pool connections, and logs. Rather than separate workspaces, observability is nested within the ADMIN workspace under `/admin/observability/`.

## Decision
1. **Hierarchical Trace Trees**: Span records render as nested nodes mapping duration weights.
2. **Service Topology Graphs**: Display visual relationship node weights representing latencies.
3. **Pluggable Widget Dashboards**: Dashboard layouts hydrate via configurable widget registries.

## Consequences
- Operations dashboards compile cleanly with zero layout replications.
- Complete root cause analysis timeline trees are visible.
