# Sprint 2.6 — OpenAPI Baseline

**Sprint:** 2.6 — Adaptive Practice Domain
**Date:** 2026-07-16
**Base Path:** `/api/v1/practice`

---

```yaml
openapi: 3.1.0
info:
  title: Clasptek Adaptive Practice API
  version: 2.6.0
  description: REST API endpoints for generating and executing personalized practice sessions.

servers:
  - url: /api/v1/practice

paths:
  /:
    get:
      summary: Retrieve student completed practice history
      parameters:
        - in: header
          name: x-student-id
          required: true
          schema:
            type: string
            format: uuid
        - in: query
          name: limit
          schema:
            type: integer
            default: 10
        - in: query
          name: offset
          schema:
            type: integer
            default: 0
      responses:
        200:
          description: List of historical sessions
    post:
      summary: Generate a practice plan from configurations
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
              required: [selectionRules, targetedCompetencies]
              properties:
                recommendationId:
                  type: string
                  format: uuid
                title:
                  type: string
                selectionRules:
                  type: array
                  items:
                    type: object
                targetedCompetencies:
                  type: array
                  items:
                    type: object
                spacingPolicy:
                  type: object
      responses:
        201:
          description: Plan generated successfully

  /{id}:
    get:
      summary: Get details of a practice session
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Session details hydrated with question version ids and feedback

  /recommendations:
    get:
      summary: List pending practice recommendations
      parameters:
        - in: header
          name: x-student-id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: List of pending recommendations
    post:
      summary: Post a recommendation
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
      responses:
        201:
          description: Created recommendation

  /recommendations/{id}/accept:
    post:
      summary: Accept a practice recommendation
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
              required: [planId]
              properties:
                planId:
                  type: string
                  format: uuid
      responses:
        200:
          description: Recommendation accepted

  /recommendations/{id}/reject:
    post:
      summary: Reject a recommendation
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Recommendation rejected

  /start:
    post:
      summary: Transition session to active state
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
                startedAt:
                  type: string
                  format: date-time
      responses:
        200:
          description: Session started

  /pause:
    post:
      summary: Pause an active session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [sessionId]
      responses:
        200:
          description: Session paused

  /resume:
    post:
      summary: Resume a paused session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [sessionId]
      responses:
        200:
          description: Session active

  /complete:
    post:
      summary: Complete session and log feedback survey
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
                completedAt:
                  type: string
                  format: date-time
                feedback:
                  type: object
      responses:
        200:
          description: Session completed
```
