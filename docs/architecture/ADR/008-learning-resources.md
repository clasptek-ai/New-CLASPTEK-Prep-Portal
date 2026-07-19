# ADR-008: Learning Resources Domain Boundaries

## Status

Accepted

## Context

Following the completion of Sprint 2.2 (Curriculum & Programme Domain), Sprint 2.3 introduces the Learning Resources Domain. The learning resources domain manages deliverable assets like video, audio, PDFs, and worksheets that students consume. We separate Lesson from Learning Resource into separate aggregates to differentiate educational hierarchies from mechanical files.

## Decision

1. **Lesson** and **LearningResource** are modelled as independent aggregate roots.
2. Introduce **ContentBlock** entities to store lesson content chunks (headings, paragraphs, etc.) flexibly.
3. Media details (storage paths, sizes, provider details) are split from business metadata (languages, difficulty levels, tags).
4. Accessibility assets (transcripts, closed captions) are built in as first-class entity options on the resource versions.

## Consequences

- Stable educational structure isolation.
- Content delivery systems can scale separate from structural course designs.
- Vector chunking/embedding readiness can be tracked on resource versions natively.
