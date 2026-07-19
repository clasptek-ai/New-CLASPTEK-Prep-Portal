import { describe, test, expect } from 'vitest';
import {
  LearningCoach,
  CoachBrain,
  CoachMemory,
  StudyGoal,
  CoachConversation,
  HabitTracker,
  CoachInsight,
  DailyStudyPlan,
  StudyPlanTask,
  CoachingStyle,
  StudyTask,
  GoalTarget,
  RevisionCampaign,
  ConversationSummary,
  MockLLMProvider,
  RuleBasedStudyPlanningEngine,
  RuleBasedMotivationEngine,
} from './index';

// ═══════════════════════════════════════════════════════════════════
// 1. VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════
describe('CoachingStyle', () => {
  test('creates with default values', () => {
    const style = CoachingStyle.default();
    expect(style.tone).toBe('ENCOURAGING');
    expect(style.pacing).toBe('BALANCED');
  });

  test('creates with custom values', () => {
    const style = new CoachingStyle('ANALYTICAL', 'INTENSIVE');
    expect(style.tone).toBe('ANALYTICAL');
    expect(style.pacing).toBe('INTENSIVE');
  });
});

describe('StudyTask', () => {
  test('creates with required fields', () => {
    const task = new StudyTask({ taskType: 'PRACTICE', title: 'Grammar Review', estimatedMinutes: 20 });
    expect(task.taskType).toBe('PRACTICE');
    expect(task.priority).toBe(3);
    expect(task.competencyCode).toBeUndefined();
  });

  test('rejects empty title', () => {
    expect(() => new StudyTask({ taskType: 'PRACTICE', title: '', estimatedMinutes: 20 })).toThrow();
  });

  test('rejects negative estimated minutes', () => {
    expect(() => new StudyTask({ taskType: 'PRACTICE', title: 'Test', estimatedMinutes: -5 })).toThrow();
  });
});

describe('GoalTarget', () => {
  test('creates with deadline', () => {
    const deadline = new Date('2026-12-01');
    const target = new GoalTarget({ targetType: 'EXAM', targetValue: 85, targetUnit: 'score', deadline });
    expect(target.targetType).toBe('EXAM');
    expect(target.deadline).toEqual(deadline);
  });
});

describe('RevisionCampaign', () => {
  test('validates start/end date order', () => {
    const start = new Date('2026-12-01');
    const end = new Date('2026-11-01');
    expect(() => new RevisionCampaign({ campaignType: 'MOCK', startDate: start, endDate: end, focusAreas: [] }))
      .toThrow('Campaign start date cannot be after end date');
  });

  test('creates valid campaign', () => {
    const campaign = new RevisionCampaign({
      campaignType: 'REVISION_A',
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-30'),
      focusAreas: ['Reading', 'Writing']
    });
    expect(campaign.focusAreas).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. LEARNING COACH AGGREGATE ROOT
// ═══════════════════════════════════════════════════════════════════
describe('LearningCoach', () => {
  test('creates with factory method', () => {
    const coach = LearningCoach.create({ studentId: 'student-1', profileId: 'profile-1' });
    expect(coach.id).toBeDefined();
    expect(coach.status).toBe('ACTIVE');
  });

  test('suspend → active lifecycle', () => {
    const coach = LearningCoach.create({ studentId: 's1', profileId: 'p1' });
    coach.suspend();
    expect(coach.status).toBe('SUSPENDED');
    coach.activate();
    expect(coach.status).toBe('ACTIVE');
  });

  test('archived coach cannot be activated', () => {
    const coach = LearningCoach.create({ studentId: 's1', profileId: 'p1' });
    coach.archive();
    expect(() => coach.activate()).toThrow('Archived coach cannot be re-activated');
  });

  test('active coach cannot be suspended twice', () => {
    const coach = LearningCoach.create({ studentId: 's1', profileId: 'p1' });
    coach.suspend();
    expect(() => coach.suspend()).toThrow('Coach must be active to suspend');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. COACH BRAIN
// ═══════════════════════════════════════════════════════════════════
describe('CoachBrain', () => {
  test('creates with rule-based engine by default', () => {
    const brain = CoachBrain.create('coach-1');
    expect(brain.activeEngine).toBe('RULE_BASED');
    expect(brain.style.tone).toBe('ENCOURAGING');
  });

  test('switches engine', () => {
    const brain = CoachBrain.create('coach-1');
    brain.switchEngine('CLAUDE', 'claude-sonnet-4-6');
    expect(brain.activeEngine).toBe('CLAUDE');
    expect(brain.llmModelId).toBe('claude-sonnet-4-6');
    expect(brain.lastActiveAt).toBeDefined();
  });

  test('updates style', () => {
    const brain = CoachBrain.create('coach-1');
    brain.updateStyle(new CoachingStyle('DIRECT', 'INTENSIVE'));
    expect(brain.style.tone).toBe('DIRECT');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. COACH MEMORY
// ═══════════════════════════════════════════════════════════════════
describe('CoachMemory', () => {
  test('creates with defaults', () => {
    const memory = CoachMemory.create('coach-1');
    expect(memory.version).toBe(1);
    expect(memory.recurringMistakes).toHaveLength(0);
  });

  test('records mistakes without duplicates', () => {
    const memory = CoachMemory.create('coach-1');
    memory.recordMistake('Verb tense confusion');
    memory.recordMistake('Verb tense confusion');
    expect(memory.recurringMistakes).toHaveLength(1);
    expect(memory.version).toBe(2);
  });

  test('records milestones and bumps version', () => {
    const memory = CoachMemory.create('coach-1');
    memory.recordMilestone('First 7-day streak');
    expect(memory.keyMilestones).toContain('First 7-day streak');
    expect(memory.version).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. STUDY GOAL — STATE MACHINE
// ═══════════════════════════════════════════════════════════════════
describe('StudyGoal state machine', () => {
  const makeGoal = () => StudyGoal.create({
    coachId: 'coach-1',
    goalType: 'WEEKLY',
    title: 'Study 5 hours this week',
    target: new GoalTarget({ targetType: 'WEEKLY', targetValue: 300, targetUnit: 'minutes' })
  });

  test('CREATED → ACTIVE → COMPLETED', () => {
    const goal = makeGoal();
    expect(goal.status).toBe('CREATED');
    goal.activate();
    expect(goal.status).toBe('ACTIVE');
    goal.updateProgress(300);
    goal.complete();
    expect(goal.status).toBe('COMPLETED');
    expect(goal.completedAt).toBeDefined();
  });

  test('ACTIVE → AT_RISK → PAUSED', () => {
    const goal = makeGoal();
    goal.activate();
    goal.markAtRisk();
    expect(goal.status).toBe('AT_RISK');
    expect(goal.riskDetectedAt).toBeDefined();
    goal.pause('Illness');
    expect(goal.status).toBe('PAUSED');
    expect(goal.pausedReason).toBe('Illness');
  });

  test('ACTIVE → FAILED → ARCHIVED', () => {
    const goal = makeGoal();
    goal.activate();
    goal.fail();
    expect(goal.status).toBe('FAILED');
    goal.archive();
    expect(goal.status).toBe('ARCHIVED');
  });

  test('calculates progress percent', () => {
    const goal = makeGoal();
    goal.activate();
    goal.updateProgress(150);
    expect(goal.progressPercent).toBe(50);
  });

  test('cannot activate from ARCHIVED', () => {
    const goal = makeGoal();
    goal.activate();
    goal.archive();
    expect(() => goal.activate()).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. COACH CONVERSATION
// ═══════════════════════════════════════════════════════════════════
describe('CoachConversation', () => {
  test('starts empty', () => {
    const convo = CoachConversation.start('coach-1', 'Grammar revision');
    expect(convo.messageCount).toBe(0);
    expect(convo.status).toBe('ACTIVE');
  });

  test('adds messages', () => {
    const convo = CoachConversation.start('coach-1');
    convo.addMessage('STUDENT', 'I need help with writing', 10);
    convo.addMessage('COACH', 'Sure, let us review your essay structure', 12);
    expect(convo.messageCount).toBe(2);
    expect(convo.totalTokens).toBe(22);
  });

  test('summarises conversation', () => {
    const convo = CoachConversation.start('coach-1');
    convo.addMessage('STUDENT', 'How do I improve?', 5);
    const summary = new ConversationSummary({
      topicsCovered: ['Writing', 'Grammar'],
      keyInsights: ['Student struggles with passive voice'],
      followUpActions: ['Practice passive→active exercises'],
      tokenCount: 5
    });
    convo.summarise(summary);
    expect(convo.status).toBe('SUMMARISED');
    expect(convo.summary?.topicsCovered).toContain('Writing');
  });

  test('cannot add messages to non-active conversation', () => {
    const convo = CoachConversation.start('coach-1');
    convo.archive();
    expect(() => convo.addMessage('STUDENT', 'hello')).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 7. HABIT TRACKER
// ═══════════════════════════════════════════════════════════════════
describe('HabitTracker', () => {
  test('records study session', () => {
    const tracker = HabitTracker.createForDate('coach-1', new Date());
    tracker.recordStudy(45, 8.5);
    expect(tracker.studied).toBe(true);
    expect(tracker.studyMinutes).toBe(45);
    expect(tracker.focusScore).toBe(8.5);
    expect(tracker.sessionCount).toBe(1);
  });

  test('accumulates multiple sessions', () => {
    const tracker = HabitTracker.createForDate('coach-1', new Date());
    tracker.recordStudy(30);
    tracker.recordStudy(45);
    expect(tracker.studyMinutes).toBe(75);
    expect(tracker.sessionCount).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 8. COACH INSIGHT (Rec 5)
// ═══════════════════════════════════════════════════════════════════
describe('CoachInsight', () => {
  test('creates insight', () => {
    const insight = CoachInsight.create({
      coachId: 'coach-1',
      category: 'WRITING',
      severity: 'HIGH',
      confidence: 0.85,
      insightText: 'Writing coherence improving slowly'
    });
    expect(insight.resolved).toBe(false);
    expect(insight.archived).toBe(false);
  });

  test('resolves insight', () => {
    const insight = CoachInsight.create({
      coachId: 'coach-1',
      category: 'READING',
      severity: 'MEDIUM',
      confidence: 0.7,
      insightText: 'Reading speed declining'
    });
    insight.resolve();
    expect(insight.resolved).toBe(true);
    expect(insight.resolvedAt).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 9. DAILY STUDY PLAN
// ═══════════════════════════════════════════════════════════════════
describe('DailyStudyPlan', () => {
  test('adds tasks and calculates total minutes', () => {
    const plan = DailyStudyPlan.generate('coach-1', new Date());
    const task = new StudyPlanTask({
      id: 'task-1',
      dailyPlanId: plan.id,
      taskType: 'PRACTICE',
      title: 'Grammar',
      estimatedMinutes: 30
    });
    plan.addTask(task);
    expect(plan.tasks).toHaveLength(1);
    expect(plan.totalMinutes).toBe(30);
  });

  test('marks task complete and updates completion rate', () => {
    const plan = DailyStudyPlan.generate('coach-1', new Date());
    const task = new StudyPlanTask({
      id: 'task-1',
      dailyPlanId: plan.id,
      taskType: 'PRACTICE',
      title: 'Grammar',
      estimatedMinutes: 30
    });
    plan.addTask(task);
    plan.checkOffTask('task-1');
    expect(plan.completedMinutes).toBe(30);
    expect(plan.completionRate).toBe(1.0);
    expect(plan.status).toBe('COMPLETED');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 10. RULE-BASED ENGINES
// ═══════════════════════════════════════════════════════════════════
describe('RuleBasedStudyPlanningEngine', () => {
  test('generates daily tasks including weak competency', async () => {
    const engine = new RuleBasedStudyPlanningEngine();
    const tasks = await engine.generateDailyTasks({
      coachId: 'c1', studentId: 's1', profileId: 'p1',
      weakCompetencies: ['Writing Coherence'],
      studyStreak: 3
    });
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0].competencyCode).toBe('Writing Coherence');
  });
});

describe('RuleBasedMotivationEngine', () => {
  test('generates encouragement for streak', async () => {
    const engine = new RuleBasedMotivationEngine();
    const msg = await engine.generateEncouragement({ coachId: 'c1', studentId: 's1', profileId: 'p1', studyStreak: 7 });
    expect(msg.content).toContain('7-day streak');
    expect(msg.urgency).toBe('LOW');
  });

  test('generates risk alert with appropriate urgency', async () => {
    const engine = new RuleBasedMotivationEngine();
    const msg = await engine.generateRiskAlert({ coachId: 'c1', studentId: 's1', profileId: 'p1', daysToExam: 14 }, 'CRITICAL');
    expect(msg.urgency).toBe('CRITICAL');
  });
});

describe('MockLLMProvider', () => {
  test('generates text with variable substitution', async () => {
    const provider = new MockLLMProvider();
    const result = await provider.generateText('Hello {{name}}!', { name: 'IELTS Student' });
    expect(result).toContain('IELTS Student');
  });

  test('estimates token count', () => {
    const provider = new MockLLMProvider();
    expect(provider.estimateTokens('Hello World')).toBeGreaterThan(0);
  });
});
