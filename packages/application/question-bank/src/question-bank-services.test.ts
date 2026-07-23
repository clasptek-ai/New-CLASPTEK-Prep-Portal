import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyGraphEngine, QuestionLockingService, PublishingWorkflowEngine } from './index';

describe('Sprint 3.3.1 Application Services — DependencyGraphEngine', () => {
  let graph: DependencyGraphEngine;

  beforeEach(() => {
    graph = new DependencyGraphEngine();
  });

  it('detects cycles in multi-resource dependency graph', () => {
    graph.addDependency('q-1', 'QUESTION', 'pas-1', 'PASSAGE', 'USES_PASSAGE');
    graph.addDependency('pas-1', 'PASSAGE', 'med-1', 'MEDIA', 'USES_AUDIO');
    expect(graph.detectCycles()).toBe(false);

    graph.addDependency('med-1', 'MEDIA', 'q-1', 'QUESTION', 'CIRCULAR_REF');
    expect(graph.detectCycles()).toBe(true);
  });

  it('generates pre-deletion impact analysis report', () => {
    graph.addDependency('asm-1', 'ASSESSMENT', 'q-101', 'QUESTION', 'CONTAINS');
    graph.addDependency('pa-1', 'PRACTICE', 'q-101', 'QUESTION', 'CONTAINS');

    const report = graph.analyzeDeletionImpact('q-101', 'QUESTION');
    expect(report.canSafeDelete).toBe(false);
    expect(report.dependentCount).toBe(2);
    expect(report.blockingReasons.length).toBeGreaterThan(0);
  });

  it('generates media reference report', () => {
    graph.addDependency('q-101', 'QUESTION', 'med-77', 'MEDIA', 'USES_IMAGE');
    graph.addDependency('pas-5', 'PASSAGE', 'med-77', 'MEDIA', 'USES_AUDIO');

    const report = graph.generateMediaUsageReport('med-77');
    expect(report.totalReferences).toBe(2);
    expect(report.referencingQuestions).toContain('q-101');
    expect(report.referencingPassages).toContain('pas-5');
  });
});

describe('Sprint 3.3.1 Application Services — QuestionLockingService', () => {
  let locking: QuestionLockingService;

  beforeEach(() => {
    locking = new QuestionLockingService(15);
  });

  it('acquires and releases editing lease', () => {
    const res = locking.acquireLock('q-201', 'editor-alice', 0, 'Alice');
    expect(res.acquired).toBe(true);
    expect(res.lease?.editorId).toBe('editor-alice');

    const conflict = locking.acquireLock('q-201', 'editor-bob', 0, 'Bob');
    expect(conflict.acquired).toBe(false);
    expect(conflict.conflictReason).toContain('locked by editor');

    locking.releaseLock('q-201', 'editor-alice');
    const bobAcquire = locking.acquireLock('q-201', 'editor-bob', 0, 'Bob');
    expect(bobAcquire.acquired).toBe(true);
  });

  it('supports admin force unlock', () => {
    locking.acquireLock('q-301', 'editor-alice', 0);
    const forceRes = locking.forceUnlock('q-301', 'admin-super', 'Browser crashed');

    expect(forceRes).toBe(true);
    expect(locking.getLease('q-301')).toBeNull();
  });
});

describe('Sprint 3.3.1 Application Services — PublishingWorkflowEngine', () => {
  let engine: PublishingWorkflowEngine;

  beforeEach(() => {
    engine = new PublishingWorkflowEngine();
  });

  it('enforces valid state transitions and emits domain events', () => {
    const t1 = engine.transition('q-1', 'QUESTION', 'DRAFT', 'TECHNICAL_REVIEW', 'author-1');
    expect(t1.newState).toBe('TECHNICAL_REVIEW');

    const t2 = engine.transition(
      'q-1',
      'QUESTION',
      'TECHNICAL_REVIEW',
      'ACADEMIC_REVIEW',
      'reviewer-1'
    );
    expect(t2.newState).toBe('ACADEMIC_REVIEW');

    const t3 = engine.transition('q-1', 'QUESTION', 'ACADEMIC_REVIEW', 'QA', 'qa-1');
    expect(t3.newState).toBe('QA');

    const t4 = engine.transition('q-1', 'QUESTION', 'QA', 'APPROVED', 'qa-lead');
    expect(t4.newState).toBe('APPROVED');
    expect(t4.emittedEvents.length).toBe(1);
    expect(t4.emittedEvents[0].eventName).toBe('QuestionApproved');

    const t5 = engine.transition('q-1', 'QUESTION', 'APPROVED', 'QUEUED', 'pub-system');
    expect(t5.newState).toBe('QUEUED');
    expect(t5.emittedEvents[0].eventName).toBe('PublishingQueued');
  });

  it('rejects invalid state transitions', () => {
    expect(() => engine.transition('q-1', 'QUESTION', 'DRAFT', 'PUBLISHED', 'author-1')).toThrow(
      'Invalid lifecycle transition'
    );
  });
});
