# Sprint 2.7 Domain Event Catalogue

1. `MockStarted`: Fired when a student initializes a full-length mock session.
2. `AnswerSubmitted`: Fired when an answer payload is recorded.
3. `SectionCompleted`: Fired when a section duration expires or section is submitted.
4. `MockSubmitted`: Fired when a full mock attempt is submitted for scoring.
5. `MockScored`: Fired when `ScoringEngine` computes raw and official scaled scores.
6. `ReadinessCalculated`: Fired when `ReadinessEngine` generates readiness % and pass probability.
7. `MockPassed`: Fired if official score meets/exceeds template passing score.
8. `MockFailed`: Fired if official score is below passing threshold.
9. `ReportGenerated`: Fired when `ReportingEngine` produces student/instructor diagnostic reports.
10. `SessionRecovered`: Fired on auto-save checkpoint recovery.
11. `AutoSubmitted`: Fired on global timer expiry.
12. `TimeExpired`: Fired on section timer expiry.
13. `BreakStarted`: Fired when official break interval begins.
14. `BreakCompleted`: Fired when break ends.
15. `ScorePublished`: Fired when result is published to student dashboard.
16. `RecommendationGenerated`: Fired when study recommendations are emitted.
17. `BlueprintCreated`: Fired when an instructor authors a new blueprint.
18. `TemplatePublished`: Fired when a blueprint is compiled into a published template.
