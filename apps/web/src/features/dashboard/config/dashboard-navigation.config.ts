export const DashboardNavigationConfig = {
  routes: {
    'diagnostic-assessment': '/student/assessments',
    'full-mock-test': '/student/mock',
    'reading-practice': '/practice?drill=reading',
    'listening-practice': '/practice?drill=listening',
    'writing-practice': '/practice?drill=writing',
    'speaking-practice': '/practice?drill=speaking',
    'vocabulary-builder': '/practice?drill=vocabulary',
    'flashcards-drill': '/practice?drill=flashcards',
    'resume-last-lesson': '/learning',
    'browse-courses': '/learning',
    'open-ai-coach': '/learning-assistant',
    'view-results': '/results',
    'view-calendar': '/student/calendar',
  } as Record<string, string>,

  getRoute(actionId: string): string {
    return this.routes[actionId] || `/practice?drill=${actionId}`;
  },
};
