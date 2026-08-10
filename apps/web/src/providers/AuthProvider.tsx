'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { UserSession } from '../features/auth/types/auth.types';
import { getSupabaseBrowserClient } from '../lib/supabase-browser';

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
        const res = await fetch('/api/v1/auth/session', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const rawRoles = (data.roles || []) as string[];
          const userObj = data.user || null;
          const profileObj = data.profile || null;

          const userSession: UserSession = {
            userId: userObj?.id || '',
            email: userObj?.email || '',
            roles: rawRoles as any,
            isAuthenticated: true,
          };

          const resolvedName =
            profileObj?.name ||
            userObj?.user_metadata?.name ||
            userObj?.user_metadata?.full_name ||
            (userObj?.user_metadata?.first_name
              ? `${userObj.user_metadata.first_name} ${userObj.user_metadata.last_name || ''}`.trim()
              : '') ||
            userObj?.email?.split('@')[0] ||
            '';

          const fullUser = {
            id: userObj?.id || '',
            email: userObj?.email || '',
            name: resolvedName,
            user_metadata: userObj?.user_metadata || {},
          };

          globalSessionCache = {
            session: userSession,
            user: fullUser,
            roles: rawRoles,
            timestamp: Date.now(),
          };

          setSession(userSession);
          setUser(fullUser);
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
    // Fetch current session on mount
    fetchSession();

    // Listen to Supabase auth events (login, logout, token refresh, recovery)
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: authListener } = supabase.auth.onAuthStateChange((event, _session) => {
        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED' ||
          event === 'PASSWORD_RECOVERY'
        ) {
          fetchSession();
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setRoles([]);
          setIsLoading(false);
          globalSessionCache = null;
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch {
      // Browser client listener fallback
    }
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

export function useOptionalAuthContext() {
  return useContext(AuthContext);
}
