# Sprint 2.4 — Architecture Freeze

## Health Status

![Architecture: PASS](https://img.shields.io/badge/Architecture-PASS-success)
![Compilation: PASS](https://img.shields.io/badge/Compilation-PASS-success)
![Tests: PASS](https://img.shields.io/badge/Tests-PASS-success)
![Quality Gate: PASS](https://img.shields.io/badge/Quality_Gate-PASS-success)

---

## 1. Domain Aggregate Roots

### Question Aggregate

Controls immutable question codes, payload versions, solutions, rubrics, accessibility media files, psychometric stats, and translations.

```mermaid
classDiagram
    class Question {
        +String id
        +QuestionCode code
        +String examProductId
        +String curriculumModuleId
        +String status
        +int lockVersion
    }
    class QuestionVersion {
        +String id
        +SemanticVersion versionNo
        +String status
        +String title
        +Object payload
        +String digitalSignature
    }
    Question "1" *-- "many" QuestionVersion
```

### ReviewRequest Aggregate

Orchestrates independent review comments, stage audits, and publication approvals.

```mermaid
classDiagram
    class ReviewRequest {
        +String id
        +String questionId
        +String status
        +WorkflowHistory[] history
    }
    class WorkflowHistory {
        +String id
        +String stage
        +String actorId
        +String comments
        +Date timestamp
    }
    ReviewRequest "1" *-- "many" WorkflowHistory
```

---

## 2. API Endpoints Catalog

- `GET /api/v1/questions` (list questions by filters)
- `GET /api/v1/questions/[id]` (retrieve complete question details)
- `GET /api/v1/questions/search` (advanced search)
- `POST /api/v1/admin/questions` (create question metadata)
- `PATCH /api/v1/admin/questions/[id]` (append version components)
- `POST /api/v1/admin/questions/[id]/create-version` (create new version draft)
- `POST /api/v1/admin/questions/[id]/publish` (finalize publication approval)
- `POST /api/v1/admin/questions/[id]/archive` (soft delete)
- `POST /api/v1/admin/questions/[id]/restore` (undo archive)
- `POST /api/v1/admin/questions/[id]/upload-media` (link media metadata)
- `POST /api/v1/admin/questions/bulk-import` (ingest bulk pipeline)
