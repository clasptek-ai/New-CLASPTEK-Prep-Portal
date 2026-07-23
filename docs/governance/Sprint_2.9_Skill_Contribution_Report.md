# Phase 2 Sprint 2.9 Addendum — Skill Contribution Report

## Overview

Separates pure mathematical percentage contributions from AI Coach explainability text and study advice generation.

## Weight Allocation Matrix

The `SkillContributionEngine` computes exact weight contributions across 7 competencies:

- **Reading**: Weight 0.20
- **Writing**: Weight 0.25
- **Listening**: Weight 0.15
- **Speaking**: Weight 0.15
- **Grammar**: Weight 0.10
- **Vocabulary**: Weight 0.10
- **Study Consistency**: Weight 0.05

Contributions are normalized so that the total sum strictly equals **100%**.

## ReadinessExplanationEngine

Converts raw contribution numbers into human-readable text, priority focus lists (e.g. lowest scoring competencies below threshold), and tailored AI Learning Coach recommendations.
