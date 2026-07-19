# ADR-009: Question Bank Domain Boundaries

## Metadata

* **Status:** Accepted
* **Implementation:** Complete
* **Frozen:** Yes
* **Supersedes:** None

## Context

Following the completion of Sprint 2.3 (Learning Resources Domain), Sprint 2.4 introduces the Question Bank Domain. The Question Bank is the authoritative source for assessment items, options, solutions, rubrics, media files, and review histories. We must design a highly decoupled architecture separating the core content aggregates from workflow reviews, psychometrics, and import pipelines.

## Decision

1. **Question** and **ReviewRequest** are established as separate aggregates.
2. The core question payload uses a registry-driven schema validator (`question_schema_registry`) to validate Single Choice, Multiple Choice, essay, coding, speaking, and listening items dynamically.
3. Media assets include transcripts, closed captions, thumbnails, and alt texts for accessibility.
4. Core psychometrics stats (facility index, discrimination index, guess probability) are tracked per question natively.
5. Multilingual translation support is designed into the core model via `question_translations`.

## Consequences

- Decoupled content from presentation engines.
- Schema registries allow registering new question types without SQL migrations.
- Complete history and validation logs of review requests are stored for auditing.
