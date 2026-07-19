# Enterprise Platform Baseline v1.3

**Version:** 1.3  
**Status:** Frozen Enterprise Baseline

## Executive Summary

This baseline freezes the enterprise architecture after Sprint 2.8 (AI Evaluation & Scoring Domain). It establishes the Intelligence Layer as the authoritative reference before Sprint 2.9.

## Included in v1.3

- AI Evaluation
- ADR-013
- AI Repository Contracts
- AI Provider Registry
- Prompt Registry
- Evaluation Profiles
- Runtime Integration
- Performance Metrics
- Sprint 2.8 Governance Package

## Intelligence Layer Diagram

```text
Assessment Runtime
        │
        ▼
Evaluation Snapshot
        │
        ▼
AI Evaluation
        │
        ▼
Published Evaluation
        │
        ▼
Student Learning Journey
        │
        ▼
Prediction Engine
```

## Runtime Integration

Assessment Runtime publishes immutable submissions.

AI Evaluation consumes:
- AssessmentInstance
- EvaluationSnapshot
- StudentAnswerSheet
- SubmissionRecord

AI Evaluation never mutates Assessment Runtime.

## AI Repository Contracts

### EvaluationRepository
- save()
- findById()
- findPublished()
- publish()
- archive()
- search()

### HumanReviewRepository
- save()
- assign()
- approve()
- reject()
- search()

### ModelRepository
- save()
- findByProvider()
- findVersion()
- listAvailable()

### PromptRepository
- save()
- findTemplate()
- findVersion()
- publish()

### EvaluationProfileRepository
- save()
- findByExam()
- publish()
- search()

## AI Event Catalogue

- EvaluationRequested
- EvaluationStarted
- ObjectiveScored
- EssayScored
- WritingScored
- SpeakingScored
- HumanReviewRequested
- ReviewCompleted
- EvaluationApproved
- EvaluationPublished
- FeedbackGenerated
- RecommendationGenerated

Consumers:
- Student Learning Journey
- Prediction Engine
- AI Learning Coach
- Enterprise Analytics

## AI Provider Registry

| Provider | Version | Status |
|---|---|---|
| OpenAI | GPT-4o | Supported |
| Azure OpenAI | GPT-4o | Supported |
| Anthropic | Claude 3.5 Sonnet | Supported |
| Gemini | 2.x Flash | Supported |
| Local | Ollama | Supported |
| Mock | CI Provider | Supported |

## Prompt Catalogue

- Writing
- Speaking
- Essay
- Coding
- Objective Feedback
- Recommendation Generation

## Evaluation Profiles

- IELTS Writing
- IELTS Speaking
- TOEFL Writing
- Digital SAT
- Internal Assessment

## Evaluation Metrics Baseline

| Metric | Target |
|---|---:|
| Objective Score | <200 ms |
| Essay Evaluation | <5 s |
| Speaking Evaluation | <10 s |
| Feedback Generation | <3 s |
| Human Review Assignment | <1 s |

## Dependency Matrix

| Domain | Reads | Writes |
|---|---|---|
| AI Evaluation | Assessment Runtime, Question Bank | AI Evaluation |
| Student Learning Journey | AI Evaluation | Student Learning |
| Prediction Engine | Student Learning Journey, AI Evaluation | Prediction |

## Sprint 2.8 Governance Package

- Sprint_2.8_Release_Review.md
- Sprint_2.8_Architecture_Freeze.md
- Sprint_2.8_Engineering_Metrics.md
- Sprint_2.8_OpenAPI_Baseline.md
- Sprint_2.8_Database_Manifest.md
- Sprint_2.8_Repository_Contracts.md
- Sprint_2.8_Performance_Baseline.md
- Sprint_2.8_Technical_Debt_Register.md
- Sprint_2.9_Readiness_Report.md

## Current Platform Position

```text
Identity & Security
        │
        ▼
Academic Authoring
        │
        ▼
Student Learning Journey
        │
        ▼
Adaptive Practice
        │
        ▼
Assessment Runtime
        │
        ▼
AI Evaluation
        │
        ▼
Prediction Engine
        │
        ▼
AI Learning Coach
```

## Responsibilities

- Question Bank owns assessment content.
- Assessment Runtime owns execution.
- AI Evaluation owns scoring and feedback.
- Student Learning Journey owns learner state.
- Adaptive Practice decides future practice.
- Prediction Engine estimates readiness.
- AI Learning Coach personalizes guidance.

## Baseline Declaration

Enterprise Platform Baseline v1.3 is approved and frozen after Sprint 2.8.
