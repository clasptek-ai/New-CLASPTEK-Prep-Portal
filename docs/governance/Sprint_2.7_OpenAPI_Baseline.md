# Sprint 2.7 — OpenAPI Baseline

**Sprint:** 2.7 — Assessment Runtime Domain
**Date:** 2026-07-16
**Base Path:** `/api/v1/runtime`

---

```yaml
openapi: 3.1.0
info:
  title: Clasptek Assessment Runtime API
  version: 2.7.0
  description: REST API endpoints for executing and monitoring assessment delivery runs.

servers:
  - url: /api/v1/runtime

paths:
  /:
    get:
      summary: Retrieve student assessment sessions
      parameters:
        - in: header
          name: x-student-id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: List of sessions
    post:
      summary: Create a new assessment session
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
              type: object
              required: [instanceId]
              properties:
                instanceId:
                  type: string
                  format: uuid
      responses:
        201:
          description: Session created successfully

  /{id}:
    get:
      summary: Retrieve details of an assessment session
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Session details snapshot

  /start:
    post:
      summary: Start an assessment session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [sessionId]
              properties:
                sessionId:
                  type: string
                  format: uuid
                at:
                  type: string
                  format: date-time
      responses:
        200:
          description: Session started successfully

  /pause:
    post:
      summary: Pause an active assessment session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [sessionId]
              properties:
                sessionId:
                  type: string
                  format: uuid
                at:
                  type: string
                  format: date-time
      responses:
        200:
          description: Session paused successfully

  /resume:
    post:
      summary: Resume a paused assessment session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [sessionId]
              properties:
                sessionId:
                  type: string
                  format: uuid
                token:
                  type: string
                at:
                  type: string
                  format: date-time
      responses:
        200:
          description: Session resumed successfully

  /answer:
    post:
      summary: Save a student question answer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [sessionId, questionId, questionVersionId, payload, state, timeSpentMs]
              properties:
                sessionId:
                  type: string
                  format: uuid
                questionId:
                  type: string
                  format: uuid
                questionVersionId:
                  type: string
                  format: uuid
                payload:
                  type: object
                state:
                  type: string
                  enum: [UNANSWERED, ANSWERED, FLAGGED, SKIPPED]
                timeSpentMs:
                  type: integer
                recordedAt:
                  type: string
                  format: date-time
      responses:
        200:
          description: Answer recorded successfully
    get:
      summary: Get the answer sheet for a session
      parameters:
        - in: query
          name: sessionId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Student answer sheet details

  /checkpoint:
    post:
      summary: Create a monotonic progress checkpoint
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [sessionId, checkpointVersion, activeQuestionId, elapsedTimeMs, answersSnapshot, checksum]
              properties:
                sessionId:
                  type: string
                  format: uuid
                checkpointVersion:
                  type: integer
                activeQuestionId:
                  type: string
                  format: uuid
                elapsedTimeMs:
                  type: integer
                answersSnapshot:
                  type: object
                deviceFingerprint:
                  type: object
                connectivitySnapshot:
                  type: object
                checksum:
                  type: string
                recordedAt:
                  type: string
                  format: date-time
      responses:
        200:
          description: Checkpoint persisted successfully
    get:
      summary: Retrieve the latest checkpoint for recovery
      parameters:
        - in: query
          name: sessionId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Latest checkpoint state

  /submit:
    post:
      summary: Submit assessment answers for final evaluation
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [sessionId, signature, serverId]
              properties:
                sessionId:
                  type: string
                  format: uuid
                signature:
                  type: string
                serverId:
                  type: string
                submittedAt:
                  type: string
                  format: date-time
      responses:
        200:
          description: Assessment submitted successfully

  /telemetry:
    post:
      summary: Log a student heartbeat or security incident
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [type, sessionId]
              properties:
                type:
                  type: string
                  enum: [heartbeat, incident]
                sessionId:
                  type: string
                  format: uuid
                elapsedTimeMs:
                  type: integer
                activeQuestionId:
                  type: string
                  format: uuid
                browserVisibility:
                  type: string
                  enum: [visible, hidden]
                networkStatus:
                  type: string
                  enum: [online, offline]
                incidentType:
                  type: string
                payload:
                  type: object
      responses:
        200:
          description: Telemetry logged successfully
    get:
      summary: Get the navigation history log for a session
      parameters:
        - in: query
          name: sessionId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Navigation visits history
```
