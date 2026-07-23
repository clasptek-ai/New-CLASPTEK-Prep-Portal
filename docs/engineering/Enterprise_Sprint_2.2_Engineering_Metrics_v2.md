# Enterprise Sprint 2.2 Engineering Metrics

# Architecture Metrics

| Metric                | Value |
| --------------------- | ----: |
| Aggregate Roots       |     2 |
| Repository Interfaces |     2 |
| Migration Files       |     4 |
| Domain Packages       |     1 |
| Application Packages  |     1 |
| REST Endpoints        |   15+ |
| Domain Events         |   12+ |

# Cross-Domain Dependency Matrix

| Domain       | Reads        | Writes       |
| ------------ | ------------ | ------------ |
| Exam Product | -            | Exam Product |
| Curriculum   | Exam Product | Curriculum   |
| Programme    | Curriculum   | Programme    |

Rules:

- No direct cross-domain writes.
- Integration through repositories/events/contracts only.

# Performance Baseline

| Operation         |  Target |
| ----------------- | ------: |
| Curriculum Search | <200 ms |
| Programme Detail  | <300 ms |
| Curriculum Tree   | <500 ms |

# OpenAPI Baseline

Freeze generated OpenAPI specification after Sprint 2.2 and use automated diff checks for future releases.

# Growth Tracking

Maintain this document after every sprint to track:

- Tables
- Packages
- Aggregates
- Entities
- Events
- APIs
- Tests
- Coverage
- Performance
