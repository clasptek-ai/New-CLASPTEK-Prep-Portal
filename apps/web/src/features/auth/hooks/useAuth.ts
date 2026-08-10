'use client';

import { useState } from 'react';
import { authService } from '../services/auth.service';
import { LoginCredentials, RegisterPayload, UserSession } from '../types/auth.types';
import { useOptionalAuthContext } from '../../../providers/AuthProvider';

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const authContext = useOptionalAuthContext();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      if (authContext?.refetchSession) {
        await authContext.refetchSession();
      }
      return res.user;
    } catch (err: any) {
      const normalized = err instanceof Error ? err : new Error(String(err?.message || err));
      setError(normalized);
      throw normalized;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.register(payload);
      if (authContext?.refetchSession) {
        await authContext.refetchSession();
      }
      return result;
    } catch (err: any) {
      const normalized = err instanceof Error ? err : new Error(String(err?.message || err));
      setError(normalized);
      throw normalized;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      if (authContext?.refetchSession) {
        await authContext.refetchSession();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, error, login, register, logout };
}
