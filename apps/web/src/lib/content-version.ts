/**
 * Canonical Content Versioning & Client Cache Invalidator
 *
 * Enforces automatic invalidation of stale client-side storage (localStorage,
 * CacheStorage, Service Workers) whenever the deployed dataset/application version changes.
 */

export const CANONICAL_CONTENT_VERSION = '2026.09.10.v2_canonical_listening';

const OBSOLETE_CACHE_KEYS = [
  'clasptek_mock_templates',
  'clasptek_mock_blueprints',
  'clasptek_mock_sessions',
  'clasptek_mock_results',
  'clasptek_universal_question_bank',
  'clasptek_listening_tracks',
  'clasptek_question_groups',
  'clasptek_reading_passages',
  'clasptek_media_library',
  'clasptek_media_assets',
  'clasptek_writing_tasks',
  'clasptek_speaking_tasks',
  'clasptek_question_bank',
];

/**
 * Checks if a persisted mock session is outdated or contains non-canonical questions.
 */
export function isStaleListeningSession(session: any): boolean {
  if (!session) return true;
  if (session.contentVersion !== CANONICAL_CONTENT_VERSION) return true;

  const sections = session.template?.sections || session.sections || [];
  const listeningSection = sections.find(
    (s: any) =>
      s.sectionName?.toLowerCase() === 'listening' || s.name?.toLowerCase() === 'listening'
  );

  // If this session has a Listening section, verify its canonical shape
  if (listeningSection) {
    const questions = listeningSection.questions || [];
    if (questions.length !== 40) return true;

    for (const q of questions) {
      if (q.code && !q.code.startsWith('IELTS-L')) return true;
      if (q.audio && !q.audio.startsWith('/audio/section-')) return true;
    }
  }

  return false;
}

/**
 * Executes cache invalidation and cleans up obsolete client storage on startup.
 */
export function checkAndInvalidateClientCaches(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const currentStoredVersion = localStorage.getItem('clasptek_content_version');

    // 1. Deregister any lingering or rogue service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        })
        .catch(() => {});
    }

    // 2. Clear browser CacheStorage if any exists
    if ('caches' in window) {
      caches
        .keys()
        .then((names) => {
          names.forEach((name) => caches.delete(name));
        })
        .catch(() => {});
    }

    // 3. Invalidate question bank & mock caches if version differs
    if (currentStoredVersion !== CANONICAL_CONTENT_VERSION) {
      for (const key of OBSOLETE_CACHE_KEYS) {
        localStorage.removeItem(key);
      }

      // Check active mock session specifically
      const savedSession = localStorage.getItem('clasptek_active_mock_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (isStaleListeningSession(parsed)) {
            localStorage.removeItem('clasptek_active_mock_session');
            localStorage.removeItem('clasptek_active_mock_answers');
          }
        } catch {
          localStorage.removeItem('clasptek_active_mock_session');
          localStorage.removeItem('clasptek_active_mock_answers');
        }
      }

      localStorage.setItem('clasptek_content_version', CANONICAL_CONTENT_VERSION);
      return true;
    } else {
      // Even if version matches, verify that any active session is not stale
      const savedSession = localStorage.getItem('clasptek_active_mock_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (isStaleListeningSession(parsed)) {
            localStorage.removeItem('clasptek_active_mock_session');
            localStorage.removeItem('clasptek_active_mock_answers');
          }
        } catch {
          localStorage.removeItem('clasptek_active_mock_session');
          localStorage.removeItem('clasptek_active_mock_answers');
        }
      }
    }
  } catch (err) {
    console.error('Failed to run client cache invalidation:', err);
  }
  return false;
}
