'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../features/auth/services/auth.service';
import { UserSession } from '../features/auth/types/auth.types';

interface AuthContextType {
  session: UserSession | null;
  isLoading: boolean;
  refetchSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchSession = async () => {
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
    refetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, refetchSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
