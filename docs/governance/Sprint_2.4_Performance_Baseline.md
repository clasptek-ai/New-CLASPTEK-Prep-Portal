# Sprint 2.4 — Performance Baseline

This document logs the database latency, pool configurations, and optimization indexes established for the Question Bank.

## 1. Mapped Performance Indexes

The following indexes are implemented inside `00403_question_bank_indexes.sql`:

- `idx_questions_code`: Unique hash mapping for code-based lookups (`O(1)` query lookup).
- `idx_question_versions_composite`: B-tree indexing on (`question_id`, `version_no`) to accelerate version lookups.
- `idx_answer_options_ver_id`: Indexing option arrays by parent version ID for fast options hydration.
- `idx_question_media_ver_id`: Media grouping B-tree index.
- `idx_question_dependencies_lookup`: Lookup index for child/parent graphs.

## 2. Pool Configuration

- **Default Connection Pool Size:** 20 connections max.
- **Idle Timeout:** 10,000 ms.
- **Connection Timeout:** 2,000 ms.

## 3. Query Target Latency

- `findById` (hydrated with options/solutions/rubrics): `< 15ms`
- `save` (with child cascade writes): `< 40ms`
- `search` (with indexing filters): `< 25ms`
