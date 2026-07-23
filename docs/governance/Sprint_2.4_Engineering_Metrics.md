# Sprint 2.4 — Engineering Metrics

## 1. Cumulative Architecture Metrics

The system currently tracks the following metrics across the platform base:

| Component Type               | Quantity | Details / Package Names                                                                                                                                                                                                                                     |
| ---------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bounded Contexts**         | 8        | Auth, Authorization, Identity, Security, Exam Product, Curriculum, Learning Resources, Question Bank                                                                                                                                                        |
| **Aggregate Roots**          | 12       | User, SecuritySession, SecurityProfile, Role, PermissionGroup, ExamProduct, Curriculum, Lesson, LearningResource, Question, ReviewRequest                                                                                                                   |
| **Domain Packages**          | 8        | `domain-auth`, `domain-authorization`, `domain-identity`, `domain-security`, `domain-exam-product`, `domain-curriculum`, `domain-learning-resources`, `domain-question-bank`                                                                                |
| **Application Packages**     | 8        | `application-auth`, `application-authorization`, `application-identity`, `application-identity-sync`, `application-exam-product`, `application-curriculum`, `application-learning-resources`, `application-question-bank`                                   |
| **Persistence Repositories** | 14       | SecuritySessionRepo, AuthenticationMethodRepo, TrustedDeviceRepo, SecurityProfileRepo, RoleRepo, PermissionGroupRepo, UserRoleRepo, ExamProductRepo, CurriculumRepo, LessonRepo, LearningResourceRepo, QuestionRepo, QuestionReviewRepo, QuestionImportRepo |
| **Domain Events**            | 18       | `UserCreated`, `QuestionCreated`, `QuestionVersionAppended`, `QuestionPublished`, `QuestionArchived`, `ReviewRequestSubmitted`, `ReviewApproved`, etc.                                                                                                      |
| **Commands**                 | 22       | CreateQuestion, CreateVersion, PublishQuestion, SubmitForReview, ImportQuestions, etc.                                                                                                                                                                      |
| **Queries**                  | 12       | SearchQuestions, GetQuestion, GetQuestionVersion, SearchResources, etc.                                                                                                                                                                                     |
| **REST APIs**                | 68       | Fully mapped endpoints across Next.js API router                                                                                                                                                                                                            |
| **Database Tables**          | 42       | Including core configuration, logs, and RLS tables                                                                                                                                                                                                          |
| **Migrations**               | 4        | `00100`, `00200`, `00300`, `00400` migration chains                                                                                                                                                                                                         |
| **ADRs**                     | 9        | `ADR-001` through `ADR-009`                                                                                                                                                                                                                                 |
| **Test Suites**              | 35       | Monorepo-wide test runner modules                                                                                                                                                                                                                           |
| **Total Tests**              | 96       | 100% green                                                                                                                                                                                                                                                  |
| **Coverage**                 | >95%     | Core domain and application layers fully tested                                                                                                                                                                                                             |

---

## 2. Enterprise Dependency Map

```text
               [ Shared Kernel ]
                       │
     ┌─────────────────┼─────────────────┐
     ▼                 ▼                 ▼
[ Auth ]        [ Authorization ]  [ Security ]
     │                 │                 │
     └─────────────────┼─────────────────┘
                       ▼
                 [ Identity ]
                       │
                       ▼
               [ Exam Product ]
                       │
                       ▼
           [ Curriculum & Programme ]
                       │
                       ▼
              [ Learning Resources ]
                       │
                       ▼
               [ Question Bank ]
```

Clean boundaries are enforced: upstream packages cannot import down-stream packages. Shared Kernel remains isolated at the bottom of the dependency chain.
