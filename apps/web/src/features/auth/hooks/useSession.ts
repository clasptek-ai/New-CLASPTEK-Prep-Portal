'use client';

import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { UserSession } from '../types/auth.types';

export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      const res = await authService.getSession();
      setSession(res);
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return { session, isLoading, refetchSession: fetchSession };
}
