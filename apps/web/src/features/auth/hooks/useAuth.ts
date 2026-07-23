'use client';

import { useState } from 'react';
import { authService } from '../services/auth.service';
import { LoginCredentials, RegisterPayload, UserSession } from '../types/auth.types';

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
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
      return await authService.register(payload);
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
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, error, login, register, logout };
}
