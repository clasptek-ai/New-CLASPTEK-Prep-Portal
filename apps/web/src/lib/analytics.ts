/**
 * Clasptek Analytics Client
 *
 * Thin wrapper around PostHog. Gracefully no-ops if NEXT_PUBLIC_POSTHOG_KEY
 * is not set. All events are fire-and-forget and never block the UI.
 *
 * Server-side events use posthog-node.
 * Client-side events use posthog-js (loaded lazily).
 *
 * Environment Variables:
 *   NEXT_PUBLIC_POSTHOG_KEY   — PostHog project API key
 *   NEXT_PUBLIC_POSTHOG_HOST  — PostHog host (default: https://app.posthog.com)
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

export type AnalyticsEvent =
  // Registration funnel
  | 'registration_started'
  | 'registration_completed'
  | 'email_verified'
  // Auth funnel
  | 'login_succeeded'
  | 'login_failed'
  | 'logout'
  | 'password_reset_requested'
  | 'password_reset_completed'
  // Assessment funnel
  | 'assessment_started'
  | 'assessment_question_answered'
  | 'assessment_autosaved'
  | 'assessment_submitted'
  | 'assessment_abandoned'
  | 'assessment_resumed'
  // Results
  | 'result_viewed'
  | 'pathway_recommended'
  | 'course_enrollment_clicked'
  // Admin
  | 'admin_student_viewed'
  | 'admin_attempt_reviewed'
  | 'admin_question_imported'
  | 'admin_dashboard_viewed';

export interface AnalyticsProperties {
  userId?: string;
  email?: string;
  attemptId?: string;
  catalogId?: string;
  score?: number;
  cefrLevel?: string;
  placementLevel?: string;
  programme?: string;
  role?: string;
  failureReason?: string;
  [key: string]: unknown;
}

/**
 * Track an event from a browser (client component).
 * Lazily imports posthog-js to keep initial bundle lean.
 */
export async function trackEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
): Promise<void> {
  if (!POSTHOG_KEY || typeof window === 'undefined') return;

  try {
    const posthog = (await import('posthog-js')).default;
    // Initialize if not already done
    if (!posthog.__loaded) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false, // manual pageview control
        persistence: 'localStorage',
        autocapture: false,
        loaded: () => {
          posthog.capture(event, {
            $timestamp: new Date().toISOString(),
            ...properties,
          });
        },
      });
    } else {
      posthog.capture(event, {
        $timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  } catch {
    // Analytics failure must never affect the user experience
  }
}

/**
 * Identify a user (call after login/registration).
 */
export async function identifyUser(
  userId: string,
  traits?: { email?: string; role?: string; programme?: string }
): Promise<void> {
  if (!POSTHOG_KEY || typeof window === 'undefined') return;

  try {
    const posthog = (await import('posthog-js')).default;
    if (posthog.__loaded) {
      posthog.identify(userId, traits);
    }
  } catch {
    // Ignore
  }
}

/**
 * Reset the analytics session (call on logout).
 */
export async function resetAnalytics(): Promise<void> {
  if (!POSTHOG_KEY || typeof window === 'undefined') return;

  try {
    const posthog = (await import('posthog-js')).default;
    if (posthog.__loaded) {
      posthog.reset();
    }
  } catch {
    // Ignore
  }
}

/**
 * Server-side event tracking via posthog-node.
 * Fire-and-forget — does not await the send.
 */
export function trackServerEvent(
  distinctId: string,
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
): void {
  if (!POSTHOG_KEY) return;

  import('posthog-node')
    .then(({ PostHog }) => {
      const client = new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST });
      client.capture({ distinctId, event, properties });
      void client.shutdown();
    })
    .catch(() => {
      // Analytics failure is non-fatal
    });
}
