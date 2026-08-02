'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { UserSession } from '../features/auth/types/auth.types';

export interface AuthContextType {
  session: UserSession | null;
  user: { id: string; email: string; name?: string; user_metadata?: Record<string, any> } | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory cache for session to prevent duplicate network calls across rapid re-mounts
let globalSessionCache: {
  session: UserSession | null;
  user: { id: string; email: string; name?: string; user_metadata?: Record<string, any> } | null;
  roles: string[];
  timestamp: number;
} | null = null;

let pendingSessionFetch: Promise<any> | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(globalSessionCache?.session || null);
  const [user, setUser] = useState<AuthContextType['user']>(globalSessionCache?.user || null);
  const [roles, setRoles] = useState<string[]>(globalSessionCache?.roles || []);
  const [isLoading, setIsLoading] = useState(!globalSessionCache);

  const fetchSession = useCallback(async () => {
    // Deduplicate concurrent fetch requests
    if (pendingSessionFetch) {
      return pendingSessionFetch;
    }

    pendingSessionFetch = (async () => {
      try {
        const res = await fetch('/api/v1/auth/session');
        if (res.ok) {
          const data = await res.json();
          const rawRoles = (data.roles || []) as string[];
          const userObj = data.user || null;
          const userSession: UserSession = {
            userId: userObj?.id || '',
            email: userObj?.email || '',
            roles: rawRoles as any,
            isAuthenticated: true,
          };

          globalSessionCache = {
            session: userSession,
            user: userObj,
            roles: rawRoles,
            timestamp: Date.now(),
          };

          setSession(userSession);
          setUser(userObj);
          setRoles(rawRoles);
        } else {
          setSession(null);
          setUser(null);
          setRoles([]);
          globalSessionCache = null;
        }
      } catch (err) {
        setSession(null);
        setUser(null);
        setRoles([]);
        globalSessionCache = null;
      } finally {
        setIsLoading(false);
        pendingSessionFetch = null;
      }
    })();

    return pendingSessionFetch;
  }, []);

  useEffect(() => {
    // Skip background session polling on public auth pages to prevent 401 console noise
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const isPublicAuthPage =
        pathname.startsWith('/reset-password') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/auth/callback');

      if (isPublicAuthPage && !globalSessionCache) {
        setIsLoading(false);
        return;
      }
    }

    fetchSession();
  }, [fetchSession]);

  const contextValue = useMemo(
    () => ({
      session,
      user,
      roles,
      isAuthenticated: Boolean(session && session.isAuthenticated),
      isLoading,
      refetchSession: fetchSession,
    }),
    [session, user, roles, isLoading, fetchSession]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
