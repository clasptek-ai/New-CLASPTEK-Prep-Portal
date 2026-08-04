export type CanonicalRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMINISTRATOR' | 'SYSTEM_ADMIN';

export interface UserSession {
  userId: string;
  email: string;
  roles: CanonicalRole[];
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  programme?: string;
  country?: string;
}

export interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  error: Error | null;
}
