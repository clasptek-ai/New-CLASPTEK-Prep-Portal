# Enterprise Analytics Data Dictionary

## Overview

This document serves as the canonical Enterprise Data Dictionary for the CLASPTEK Prep Portal Learning Analytics Platform (Sprint 2.11.1 Enterprise Baseline).

## Schema Tables

### `analytics_metric_catalog`

| Column Name           | Type         | Constraints      | Description                                           |
| --------------------- | ------------ | ---------------- | ----------------------------------------------------- |
| `id`                  | UUID         | PRIMARY KEY      | Unique metric catalog entry identifier                |
| `code`                | VARCHAR(100) | UNIQUE, NOT NULL | Machine-readable metric code (e.g. `RETENTION_RATE`)  |
| `name`                | VARCHAR(255) | NOT NULL         | Human-readable metric display name                    |
| `business_definition` | TEXT         | NOT NULL         | Formal business logic definition                      |
| `owner_team`          | VARCHAR(100) | NOT NULL         | Responsible engineering/data team                     |
| `owner_email`         | VARCHAR(255) | NOT NULL         | Primary contact owner email                           |
| `refresh_policy`      | VARCHAR(50)  | NOT NULL         | Policy type (`REALTIME`, `HOURLY`, `DAILY`, `WEEKLY`) |
| `current_version`     | VARCHAR(50)  | NOT NULL         | Active calculation version string (e.g. `v1.0.0`)     |
| `status`              | VARCHAR(50)  | NOT NULL         | Operational status (`ACTIVE`, `DEPRECATED`, `DRAFT`)  |

### `analytics_snapshots`

| Column Name          | Type        | Constraints | Description                             |
| -------------------- | ----------- | ----------- | --------------------------------------- |
| `id`                 | UUID        | PRIMARY KEY | Unique snapshot execution identifier    |
| `generated_at`       | TIMESTAMP   | NOT NULL    | Point-in-time snapshot timestamp        |
| `warehouse_version`  | VARCHAR(50) | NOT NULL    | Materialized view warehouse version     |
| `metric_versions`    | JSONB       | NOT NULL    | Version mapping for all calculated KPIs |
| `benchmark_version`  | VARCHAR(50) | NOT NULL    | Institutional benchmark model version   |
| `prediction_version` | VARCHAR(50) | NOT NULL    | ML prediction forecast version          |

### `analytics_research_export_jobs`

| Column Name     | Type         | Constraints | Description                                                                                  |
| --------------- | ------------ | ----------- | -------------------------------------------------------------------------------------------- |
| `id`            | UUID         | PRIMARY KEY | Unique export request ID                                                                     |
| `requested_by`  | VARCHAR(255) | NOT NULL    | Authenticated requester user ID                                                              |
| `datasetType`   | VARCHAR(100) | NOT NULL    | Export target domain                                                                         |
| `status`        | VARCHAR(50)  | NOT NULL    | Lifecycle state (`REQUESTED`, `VALIDATING`, `ANONYMIZING`, `AGGREGATING`, `READY`, `FAILED`) |
| `is_anonymized` | BOOLEAN      | NOT NULL    | Anonymization flag (Strict zero-PII compliance)                                              |
| `record_count`  | INT          | NOT NULL    | Total records exported                                                                       |
| `file_url`      | TEXT         | NULLABLE    | Secure time-limited download URL                                                             |
