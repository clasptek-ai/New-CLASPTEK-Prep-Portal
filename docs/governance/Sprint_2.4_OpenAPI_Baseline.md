# Sprint 2.4 — OpenAPI Baseline

This document specifies the frozen OpenAPI 3.0 specification snippet for the Question Bank Domain endpoints.

```yaml
openapi: 3.0.3
info:
  title: Clasptek Prep Portal V2 - Question Bank
  version: 1.4.0
paths:
  /api/v1/questions:
    get:
      summary: Retrieve list of questions matching filters
      parameters:
        - name: examProductId
          in: query
          schema:
            type: string
        - name: curriculumModuleId
          in: query
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
      responses:
        '200':
          description: A list of questions
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/QuestionSummary'

  /api/v1/questions/{id}:
    get:
      summary: Retrieve full details of a question by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: A detailed question aggregate representation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QuestionDetails'

  /api/v1/admin/questions:
    post:
      summary: Create a new question metadata container
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - code
              properties:
                code:
                  type: string
                examProductId:
                  type: string
                curriculumModuleId:
                  type: string
      responses:
        '201':
          description: Created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  id:
                    type: string

components:
  schemas:
    QuestionSummary:
      type: object
      properties:
        id:
          type: string
        code:
          type: string
        examProductId:
          type: string
        curriculumModuleId:
          type: string
        status:
          type: string
    QuestionDetails:
      type: object
      properties:
        id:
          type: string
        code:
          type: string
        status:
          type: string
        versions:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              versionNo:
                type: string
              status:
                type: string
              title:
                type: string
```
