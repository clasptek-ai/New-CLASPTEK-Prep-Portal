export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const plan = {
    id: 'plan-dyn-01',
    exam: 'IELTS Academic',
    targetScore: 'Band 7.5',
    currentScore: 'Band 6.5',
    daysRemaining: 43,
    currentWeek: 1,
    weeklyMilestone: 'Master Academic Reading Matching Headings & Boost Accuracy to 80%',
    schedule: [
      {
        day: 'Monday',
        focus: 'Reading Passage 1: Matching Headings',
        activityType: 'PRACTICE',
        targetQuestions: 15,
        durationMinutes: 45,
        completed: true,
      },
      {
        day: 'Tuesday',
        focus: 'Writing Task 2: Sentence Structure & Cohesion',
        activityType: 'LESSON',
        targetQuestions: 5,
        durationMinutes: 30,
        completed: true,
      },
      {
        day: 'Wednesday',
        focus: 'Academic Vocabulary Building & Phrase Bank',
        activityType: 'VOCABULARY',
        targetQuestions: 20,
        durationMinutes: 25,
        completed: false,
      },
      {
        day: 'Thursday',
        focus: 'Target Weakness: Matching Headings & True/False/Not Given',
        activityType: 'PRACTICE',
        targetQuestions: 15,
        durationMinutes: 40,
        completed: false,
      },
      {
        day: 'Friday',
        focus: 'Active Rest Day & Vocabulary Flashcards Review',
        activityType: 'REST',
        targetQuestions: 0,
        durationMinutes: 15,
        completed: false,
      },
      {
        day: 'Saturday',
        focus: 'Official Full-Length Timed Mock Examination',
        activityType: 'MOCK',
        targetQuestions: 40,
        durationMinutes: 165,
        completed: false,
      },
      {
        day: 'Sunday',
        focus: 'Mock Result Rationale Review & Weak Spot Analysis',
        activityType: 'LESSON',
        targetQuestions: 0,
        durationMinutes: 45,
        completed: false,
      },
    ],
  };

  return NextResponse.json({ success: true, data: plan }, { status: 200 });
}
