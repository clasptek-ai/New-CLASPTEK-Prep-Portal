# Data Integration Matrix — Sprint 2.10

## Overview

The Learning Assistant orchestrates data across 6 core bounded contexts within the CLASPTEK Prep Portal platform.

| Source Bounded Context       | Data Consumed                            | Consumer Engine / Handler                 | Impact on Plan                                                 |
| ---------------------------- | ---------------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| **AI Evaluation**            | Rubric scores, criterion mastery         | `SkillAnalysisEngine`                     | Identifies writing & speaking skill deficits                   |
| **Readiness & Prediction**   | Readiness score, projected exam score    | `StudyPlanEngine`, `RecommendationEngine` | Adjusts daily study duration & target recommendations          |
| **Adaptive Practice**        | Practice attempt history, skill accuracy | `SkillAnalysisEngine`, `RevisionEngine`   | Determines active vs. dormant skills                           |
| **Mock Examination**         | Mock test scores, section timing         | `RecommendationEngine`                    | Triggers full-length mock recommendations when readiness >= 75 |
| **Student Learning Journey** | Target exam date, target score           | `StudyPlanEngine`                         | Sets deadline horizon and total daily study budget             |
| **Learning Analytics**       | Historical score trends, study velocity  | `WeeklyPlannerEngine`                     | Adjusts weekly focus skills                                    |
