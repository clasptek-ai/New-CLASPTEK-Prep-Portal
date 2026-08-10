export interface AuthRedirectLogPayload {
  reason: string;
  currentUrl: string;
  session: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  authUserRepoId: string | null;
}

/**
 * Forensic logger for authentication redirects to /login.
 * Formats and outputs structured diagnostic evidence for desktop and mobile authentication inspection.
 */
export function logAuthRedirectToLogin(payload: AuthRedirectLogPayload): void {
  const formatted = {
    timestamp: new Date().toISOString(),
    event: 'AUTH_REDIRECT_TO_LOGIN',
    currentUrl: payload.currentUrl,
    routeGuardReason: payload.reason,
    session: payload.session,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    userId: payload.userId,
    authUserRepoId: payload.authUserRepoId,
  };

  console.warn('[FORENSIC_AUTH_AUDIT] Redirecting to /login:', JSON.stringify(formatted, null, 2));
}
