import { describe, test, expect } from 'vitest';
import { StudentJourneyStateMachine, StudentExamPolicy, type StudentJourneyStage } from './index';

describe('Student Journey State Machine & Policy Engine (Sprint 3.1.1)', () => {
  test('enforces linear journey flow: REGISTRATION -> DIAGNOSTIC -> DIAGNOSTIC_RESULTS', () => {
    let current: StudentJourneyStage = 'REGISTRATION';
    current = StudentJourneyStateMachine.transition(current, 'DIAGNOSTIC');
    expect(current).toBe('DIAGNOSTIC');

    current = StudentJourneyStateMachine.transition(current, 'DIAGNOSTIC_RESULTS');
    expect(current).toBe('DIAGNOSTIC_RESULTS');
  });

  test('prevents bypassing diagnostic to reach practice or mock directly', () => {
    expect(() => {
      StudentJourneyStateMachine.transition('REGISTRATION', 'PRACTICE_STARTED');
    }).toThrow('Invalid Student Journey Transition');

    expect(() => {
      StudentJourneyStateMachine.transition('REGISTRATION', 'MOCK_STARTED');
    }).toThrow('Invalid Student Journey Transition');
  });

  test('StudentExamPolicy enforces diagnostic completion requirement', () => {
    expect(StudentExamPolicy.isDiagnosticRequired(false)).toBe(true);
    expect(StudentExamPolicy.isDiagnosticRequired(true)).toBe(false);
  });

  test('StudentExamPolicy enforces admin unlock requirements for practice and mock', () => {
    // Diagnostic completed, but Admin unlock false -> Practice locked
    expect(StudentExamPolicy.isPracticeUnlocked(true, false)).toBe(false);
    // Diagnostic completed AND Admin unlock true -> Practice unlocked
    expect(StudentExamPolicy.isPracticeUnlocked(true, true)).toBe(true);

    // Practice completed, but Admin unlock false -> Mock locked
    expect(StudentExamPolicy.isMockUnlocked(true, false)).toBe(false);
    // Practice completed AND Admin unlock true -> Mock unlocked
    expect(StudentExamPolicy.isMockUnlocked(true, true)).toBe(true);
  });

  test('StudentExamPolicy prevents modification of submitted attempts', () => {
    expect(() => StudentExamPolicy.assertAttemptMutable(true)).toThrow(
      'Forbidden: Submitted attempts are immutable and cannot be modified.'
    );
    expect(() => StudentExamPolicy.assertAttemptMutable(false)).not.toThrow();
  });
});
