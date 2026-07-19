openapi: 3.1.0
info:
  title: Clasptek Prep Portal — AI Evaluation & Scoring API
  version: 2.8.0
  description: |
    REST API for the AI Evaluation & Scoring bounded context.
    Handles evaluation queueing, result retrieval, feedback delivery,
    and human review workflows.

servers:
  - url: /api/v1
    description: Next.js App Router API

tags:
  - name: Evaluations
    description: Evaluation lifecycle management
  - name: Feedback
    description: Feedback and recommendation delivery
  - name: Admin
    description: Admin and reviewer evaluation management

paths:
  /evaluations:
    get:
      operationId: searchEvaluations
      tags: [Evaluations]
      summary: Search evaluation jobs (student-scoped)
      parameters:
        - in: header
          name: x-student-id
          required: true
          schema:
            type: string
            format: uuid
        - in: query
          name: submissionId
          schema: { type: string, format: uuid }
        - in: query
          name: status
          schema:
            type: string
            enum: [QUEUED, RUNNING, COMPLETED, FAILED, HUMAN_REVIEW_REQUIRED, APPROVED, PUBLISHED, ARCHIVED]
        - in: query
          name: questionType
          schema:
            type: string
            enum: [OBJECTIVE, ESSAY, WRITING, SPEAKING, CODING, STRUCTURED]
        - in: query
          name: limit
          schema: { type: integer, default: 20, maximum: 100 }
        - in: query
          name: offset
          schema: { type: integer, default: 0 }
      responses:
        '200':
          description: List of evaluation jobs
          content:
            application/json:
              schema:
                type: object
                properties:
                  jobs:
                    type: array
                    items:
                      $ref: '#/components/schemas/EvaluationJobSummary'
                  count:
                    type: integer
        '401':
          $ref: '#/components/responses/Unauthorized'

    post:
      operationId: queueEvaluation
      tags: [Evaluations]
      summary: Queue a new evaluation job
      parameters:
        - in: header
          name: x-student-id
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/QueueEvaluationRequest'
      responses:
        '201':
          description: Evaluation queued
          content:
            application/json:
              schema:
                type: object
                properties:
                  jobId:
                    type: string
                    format: uuid
                  snapshotId:
                    type: string
                    format: uuid
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /evaluations/{id}:
    get:
      operationId: getEvaluation
      tags: [Evaluations]
      summary: Fetch evaluation result by job or result ID
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string, format: uuid }
        - in: header
          name: x-student-id
          required: true
          schema:
            type: string
            format: uuid
        - in: query
          name: type
          schema:
            type: string
            enum: [job, result]
            default: job
      responses:
        '200':
          description: Evaluation result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EvaluationResultResponse'
        '404':
          $ref: '#/components/responses/NotFound'
        '403':
          $ref: '#/components/responses/Forbidden'

  /evaluations/{id}/feedback:
    get:
      operationId: getEvaluationFeedback
      tags: [Feedback]
      summary: Fetch feedback, recommendations, and evidence for a published evaluation
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string, format: uuid }
        - in: header
          name: x-student-id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Evaluation feedback
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EvaluationFeedbackResponse'
        '403':
          description: Not published yet or access denied
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          $ref: '#/components/responses/NotFound'

  /evaluations/{id}/approve:
    post:
      operationId: approveOrPublishEvaluation
      tags: [Admin]
      summary: Approve or publish an evaluation (admin/reviewer only)
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string, format: uuid }
        - in: header
          name: x-role
          required: true
          schema:
            type: string
            enum: [admin, reviewer]
        - in: query
          name: action
          schema:
            type: string
            enum: [approve, publish]
            default: approve
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                approvedBy:
                  type: string
                reviewId:
                  type: string
                  format: uuid
                comments:
                  type: array
                  items:
                    type: object
                    properties:
                      criterionCode: { type: string }
                      commentText: { type: string }
                      decision: { type: string }
      responses:
        '200':
          description: Action completed
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean }
                  action: { type: string }
        '403':
          $ref: '#/components/responses/Forbidden'
        '400':
          $ref: '#/components/responses/BadRequest'

  /evaluations/{id}/review:
    post:
      operationId: requestHumanReview
      tags: [Admin]
      summary: Request human review for an evaluation job
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string, format: uuid }
        - in: header
          name: x-role
          required: true
          schema:
            type: string
            enum: [admin, reviewer]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [resultId, reason]
              properties:
                resultId:
                  type: string
                  format: uuid
                reason:
                  type: string
                reviewerId:
                  type: string
                  format: uuid
      responses:
        '201':
          description: Review requested
          content:
            application/json:
              schema:
                type: object
                properties:
                  reviewId: { type: string, format: uuid }
        '403':
          $ref: '#/components/responses/Forbidden'

    patch:
      operationId: overrideScore
      tags: [Admin]
      summary: Override a criterion score in a review
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string, format: uuid }
        - in: header
          name: x-role
          required: true
          schema:
            type: string
            enum: [admin, reviewer]
        - in: header
          name: x-reviewer-id
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reviewId, overrideScore, rationale]
              properties:
                reviewId:
                  type: string
                  format: uuid
                criterionCode:
                  type: string
                overrideScore:
                  type: number
                rationale:
                  type: string
      responses:
        '200':
          description: Score overridden
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean }
        '403':
          $ref: '#/components/responses/Forbidden'

components:
  schemas:
    QueueEvaluationRequest:
      type: object
      required: [submissionId, sessionId, questionType]
      properties:
        submissionId:
          type: string
          format: uuid
        sessionId:
          type: string
          format: uuid
        questionType:
          type: string
          enum: [OBJECTIVE, ESSAY, WRITING, SPEAKING, CODING, STRUCTURED]
        questionSnapshot:
          type: object
        rubricSnapshot:
          type: object
        submissionSnapshot:
          type: object
        profileCode:
          type: string
          description: Evaluation profile code (e.g. 'IELTS_WRITING')
        evaluationSettings:
          type: object
        priority:
          type: integer
          minimum: 1
          maximum: 10
          default: 5

    EvaluationJobSummary:
      type: object
      properties:
        id: { type: string, format: uuid }
        studentId: { type: string, format: uuid }
        submissionId: { type: string, format: uuid }
        questionType: { type: string }
        status: { type: string }
        priority: { type: integer }
        attempts: { type: integer }
        queuedAt: { type: string, format: date-time }

    EvaluationResultResponse:
      type: object
      properties:
        id: { type: string, format: uuid }
        jobId: { type: string, format: uuid }
        studentId: { type: string, format: uuid }
        questionType: { type: string }
        rawScore: { type: number }
        maxScore: { type: number }
        bandScore: { type: string }
        scorePercentage: { type: number }
        isCorrect: { type: boolean }
        confidence: { type: number, minimum: 0, maximum: 1 }
        isPublished: { type: boolean }
        createdAt: { type: string, format: date-time }

    EvaluationFeedbackResponse:
      type: object
      properties:
        feedbackSections:
          type: array
          items:
            type: object
            properties:
              id: { type: string, format: uuid }
              sectionType: { type: string }
              criterionCode: { type: string }
              content: { type: string }
              severity: { type: string }
              orderIndex: { type: integer }
        recommendations:
          type: array
          items:
            type: object
            properties:
              id: { type: string, format: uuid }
              recommendationType: { type: string }
              priority: { type: string }
              title: { type: string }
              description: { type: string }
              targetCompetencyCode: { type: string }
        evidenceReferences:
          type: array
          items:
            type: object
            properties:
              id: { type: string, format: uuid }
              criterionCode: { type: string }
              textExcerpt: { type: string }
              relevanceNote: { type: string }

    Error:
      type: object
      properties:
        error:
          type: string

  responses:
    Unauthorized:
      description: Missing or invalid student ID
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Forbidden:
      description: Access denied
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    BadRequest:
      description: Invalid request body
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
