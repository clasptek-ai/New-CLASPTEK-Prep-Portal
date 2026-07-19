# Sprint 2.5 — OpenAPI Baseline

**Sprint:** 2.5 — Student Learning Journey Domain
**Date:** 2026-07-16
**Base Path:** `/api/v1/student`

---

```yaml
openapi: 3.1.0
info:
  title: Clasptek Student Learning Journey API
  version: 2.5.0
  description: REST API for the Student Learning Journey Domain

servers:
  - url: /api/v1/student
    description: Student Learning API

paths:
  /journey:
    get:
      summary: Get student learning journey
      description: Returns the active learning journey for the authenticated student
      parameters:
        - in: header
          name: x-student-id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Journey found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JourneySummary'
        404:
          description: Journey not found
    post:
      summary: Create a new learning journey
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [studentId]
              properties:
                studentId:
                  type: string
                  format: uuid
                activate:
                  type: boolean
                  description: If true, immediately activates the journey
      responses:
        201:
          description: Journey created
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid

  /programmes:
    get:
      summary: List programme enrolments
      parameters:
        - in: query
          name: journeyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Enrolment list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/EnrolmentSummary'
    post:
      summary: Enrol in a programme
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [journeyId, programmeId, programmeVersionId]
              properties:
                journeyId:
                  type: string
                  format: uuid
                programmeId:
                  type: string
                  format: uuid
                programmeVersionId:
                  type: string
                  format: uuid
                deliveryMode:
                  type: string
                  enum: [ONLINE, BLENDED, IN_PERSON]
                cohortId:
                  type: string
                  format: uuid
                intakeDate:
                  type: string
                  format: date
      responses:
        201:
          description: Enrolment created

  /programmes/{id}:
    patch:
      summary: Update programme enrolment (withdraw)
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [action, journeyId]
              properties:
                action:
                  type: string
                  enum: [withdraw]
                journeyId:
                  type: string
                  format: uuid
                reason:
                  type: string
      responses:
        200:
          description: Updated

  /goals:
    get:
      summary: List learning goals
      parameters:
        - in: query
          name: journeyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Goals list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/GoalSummary'
    post:
      summary: Create a learning goal
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [journeyId, title]
              properties:
                journeyId:
                  type: string
                  format: uuid
                title:
                  type: string
                  maxLength: 200
                description:
                  type: string
                priority:
                  type: string
                  enum: [LOW, MEDIUM, HIGH, CRITICAL]
                  default: MEDIUM
                targetDate:
                  type: string
                  format: date
      responses:
        201:
          description: Goal created

  /goals/{id}:
    patch:
      summary: Complete a learning goal
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [journeyId, action]
              properties:
                journeyId:
                  type: string
                  format: uuid
                action:
                  type: string
                  enum: [complete]
      responses:
        200:
          description: Goal updated

  /study-session/start:
    post:
      summary: Start a study session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [journeyId]
              properties:
                journeyId:
                  type: string
                  format: uuid
                programmeId:
                  type: string
                  format: uuid
                deviceType:
                  type: string
                  enum: [Desktop, Mobile, Tablet]
                platform:
                  type: string
                timezone:
                  type: string
      responses:
        201:
          description: Session started
          content:
            application/json:
              schema:
                type: object
                properties:
                  sessionId:
                    type: string
                    format: uuid

  /study-session/end:
    post:
      summary: End a study session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [journeyId, sessionId, durationMs]
              properties:
                journeyId:
                  type: string
                  format: uuid
                sessionId:
                  type: string
                  format: uuid
                durationMs:
                  type: integer
                  minimum: 0
                completionReason:
                  type: string
      responses:
        200:
          description: Session ended

  /dashboard:
    get:
      summary: Get student dashboard projection
      description: Returns the pre-computed dashboard read model. Target < 250ms.
      parameters:
        - in: query
          name: studentId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Dashboard projection
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DashboardProjection'

  /statistics:
    get:
      summary: Get study statistics
      parameters:
        - in: query
          name: journeyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Statistics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StudyStatistics'

  /bookmarks:
    get:
      summary: List bookmarks
      parameters:
        - in: query
          name: journeyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Bookmarks list
    post:
      summary: Add a bookmark
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [journeyId, resourceType, resourceId]
              properties:
                journeyId:
                  type: string
                  format: uuid
                resourceType:
                  type: string
                  enum: [LESSON, MODULE, QUESTION, RESOURCE, PROGRAMME]
                resourceId:
                  type: string
                  format: uuid
                notes:
                  type: string
      responses:
        201:
          description: Bookmark created

  /bookmarks/{id}:
    delete:
      summary: Remove a bookmark
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
        - in: query
          name: journeyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Bookmark removed

  /achievements:
    get:
      summary: List earned achievements
      parameters:
        - in: query
          name: journeyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Achievements list

  /timeline:
    get:
      summary: Get learning timeline
      parameters:
        - in: query
          name: journeyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Timeline of completed milestones

  /learning-plan:
    get:
      summary: Get active learning plan
      parameters:
        - in: query
          name: journeyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Learning plan
    post:
      summary: Create a learning plan
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [journeyId, studentId]
              properties:
                journeyId:
                  type: string
                  format: uuid
                studentId:
                  type: string
                  format: uuid
                title:
                  type: string
                versionSource:
                  type: string
                  enum: [AI_GENERATED, INSTRUCTOR, STUDENT]
      responses:
        201:
          description: Plan created

  /archive:
    post:
      summary: Archive a journey
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [journeyId]
              properties:
                journeyId:
                  type: string
                  format: uuid
      responses:
        200:
          description: Journey archived

components:
  schemas:
    JourneySummary:
      type: object
      properties:
        id:
          type: string
          format: uuid
        studentId:
          type: string
          format: uuid
        status:
          type: string
          enum: [CREATED, ACTIVE, PAUSED, COMPLETED, ARCHIVED]
        streak:
          type: object
          properties:
            current:
              type: integer
            longest:
              type: integer
        consentGiven:
          type: boolean
        goalsCount:
          type: integer
        milestonesCount:
          type: integer
        achievementsCount:
          type: integer
        bookmarksCount:
          type: integer

    EnrolmentSummary:
      type: object
      properties:
        id:
          type: string
          format: uuid
        programmeId:
          type: string
          format: uuid
        status:
          type: string
          enum: [ACTIVE, WITHDRAWN, SUSPENDED, COMPLETED]
        deliveryMode:
          type: string
        paymentVerified:
          type: boolean

    GoalSummary:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        priority:
          type: string
          enum: [LOW, MEDIUM, HIGH, CRITICAL]
        status:
          type: string
          enum: [DRAFT, ACTIVE, COMPLETED, CANCELLED]
        targetDate:
          type: string
          format: date
        completedAt:
          type: string
          format: date-time

    DashboardProjection:
      type: object
      properties:
        journeyId:
          type: string
          format: uuid
        studentId:
          type: string
          format: uuid
        activeProgrammeId:
          type: string
          format: uuid
        activeProgrammeName:
          type: string
        overallProgress:
          type: number
          minimum: 0
          maximum: 100
        currentGoal:
          type: object
          properties:
            id:
              type: string
            title:
              type: string
        currentStreak:
          type: integer
        nextMilestone:
          type: object
          properties:
            id:
              type: string
            title:
              type: string
        lastUpdated:
          type: string
          format: date-time

    StudyStatistics:
      type: object
      properties:
        totalSessions:
          type: integer
        totalStudyTimeMs:
          type: integer
        currentStreak:
          type: integer
        longestStreak:
          type: integer
        goalsCompleted:
          type: integer
        milestonesCompleted:
          type: integer
        achievementsEarned:
          type: integer
        bookmarksCount:
          type: integer
```
