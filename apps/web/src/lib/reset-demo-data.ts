/**
 * Central utility to reset all demo data and restore initial clean states.
 */
export function resetAllDemoData(): { success: boolean; removedKeysCount: number } {
  if (typeof window === 'undefined') {
    return { success: false, removedKeysCount: 0 };
  }

  const demoDataKeys = [
    'clasptek_universal_question_bank',
    'clasptek_passage_repository',
    'clasptek_media_library',
    'clasptek_question_bank',
    'clasptek_student_bookmarks',
    'clasptek_student_practice_history',
    'clasptek_student_skill_progress',
    'clasptek_mock_blueprints',
    'clasptek_mock_templates',
    'clasptek_mock_sessions',
    'clasptek_mock_results',
    'clasptek_ai_learner_profile',
    'clasptek_ai_study_plan',
    'clasptek_admin_users',
    'clasptek_admin_assessments',
    'clasptek_workspace',
    'clasptek_auth_session',
  ];

  let count = 0;
  demoDataKeys.forEach((key) => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      count++;
    }
  });

  return { success: true, removedKeysCount: count };
}
