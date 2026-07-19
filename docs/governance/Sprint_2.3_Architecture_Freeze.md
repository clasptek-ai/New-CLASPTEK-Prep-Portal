# Sprint-2.3 Architecture Freeze - Learning Resources Domain

## Health Status Badges
![Architecture: PASS](https://img.shields.io/badge/Architecture-PASS-success)
![Compilation: PASS](https://img.shields.io/badge/Compilation-PASS-success)
![Tests: PASS](https://img.shields.io/badge/Tests-PASS-success)
![Quality Gate: PASS](https://img.shields.io/badge/Quality_Gate-PASS-success)

---

## 1. Refined Aggregate Model (DDD Boundaries)

We separated the Lessons structure from deliverable asset files as two distinct aggregate roots.

### Lesson Aggregate
Controls stable lesson hierarchies, version histories, metadata, and sequential content blocks.
```mermaid
classDiagram
    class Lesson {
        +String id
        +String moduleId
        +LessonCode code
        +String name
        +String description
        +int displayOrder
        +String status
        +int lockVersion
    }
    class LessonVersion {
        +String id
        +String lessonId
        +SemanticVersion versionNo
        +String status
        +String name
        +String description
        +ContentBlock[] contentBlocks
    }
    class ContentBlock {
        +String id
        +String lessonVersionId
        +String blockType
        +String textContent
        +int displayOrder
    }
    Lesson "1" *-- "many" LessonVersion
    LessonVersion "1" *-- "many" ContentBlock
```

### Learning Resource Aggregate
Controls individual video, audio, PDF, and reading passage assets, download link stubs, and closed captions.
```mermaid
classDiagram
    class LearningResource {
        +String id
        +String lessonId
        +ResourceCode code
        +String resourceType
        +String slug
        +String name
        +String description
        +int displayOrder
        +String status
        +int lockVersion
    }
    class ResourceVersion {
        +String id
        +String learningResourceId
        +SemanticVersion versionNo
        +String status
        +String name
        +String description
        +MediaAsset mediaAsset
        +Attachment[] attachments
        +Download[] downloads
        +ExternalLink[] externalLinks
        +Transcript[] transcripts
        +Caption[] captions
    }
    LearningResource "1" *-- "many" ResourceVersion
```

---

## 2. API Endpoints Catalog

- `GET /api/v1/lessons` (list by moduleId)
- `GET /api/v1/lessons/[id]` (retrieve blocks)
- `GET /api/v1/resources/[id]` (retrieve media metadata)
- `GET /api/v1/resources/search` (advanced filters)
- `POST /api/v1/admin/lessons` (create)
- `PATCH /api/v1/admin/lessons/[id]` (add blocks, versions)
- `POST /api/v1/admin/resources` (create)
- `PATCH /api/v1/admin/resources/[id]` (add versions, metadata)
- `POST /api/v1/admin/resources/[id]/publish` (publish version)
- `POST /api/v1/admin/resources/[id]/archive` (archive)
- `POST /api/v1/admin/resources/[id]/restore` (restore)
- `POST /api/v1/admin/resources/[id]/upload` (upload media, transcripts)

---

## 3. Database Schema

Tables created in migration:
- `lessons`
- `lesson_versions`
- `content_blocks`
- `learning_resources`
- `learning_resource_versions`
- `media_assets`
- `resource_attachments`
- `resource_tags`
- `resource_metadata`
- `resource_transcripts`
- `resource_captions`
- `resource_downloads`
- `resource_links`

---

## 4. Verification Results
All 84 tests successfully passed.
The entire monorepo compiled cleanly.
