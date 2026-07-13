import { PrincipalContext, hasPermission, PermissionCode } from '@clasptek/domain-authorization';
import { AuthenticationError, AuthorizationError } from '@clasptek/kernel';

export class JWTParser {
  /**
   * Decodes a JWT token. In custom systems, parses Supabase claims structure.
   */
  public static parse(token: string): Record<string, any> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('JWT token structure is malformed');
      }
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      return JSON.parse(decodedPayload);
    } catch {
      throw new AuthenticationError('Session JWT could not be authenticated');
    }
  }
}

export class AccessControlGuard {
  /**
   * Evaluates active JWT session context.
   */
  public static authenticate(cookieValue: string | null): PrincipalContext {
    if (!cookieValue) {
      throw new AuthenticationError('Session cookie not provided');
    }

    const payload = JWTParser.parse(cookieValue);

    // Validate claims
    if (!payload.sub) {
      throw new AuthenticationError("Principal claim 'sub' is missing");
    }

    // Load roles and permissions mapping from JWT custom claims metadata
    const permissions: PermissionCode[] = payload.permissions || [];

    return {
      userId: payload.sub,
      academyId: payload.academyId,
      permissions,
    };
  }

  /**
   * Enforces specific permission checks.
   */
  public static authorize(principal: PrincipalContext, required: PermissionCode): void {
    if (!hasPermission(principal, required)) {
      throw new AuthorizationError(
        `Privilege constraint violation: Missing permission "${required}"`
      );
    }
  }
}
