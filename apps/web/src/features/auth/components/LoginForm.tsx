'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas/auth.schemas';
import { useAuth } from '../hooks/useAuth';
import { Input, Button, Card } from '../../../components/ui/ui-components';
import { BrandConfig } from '@/config/brand.config';
import { LogoBadge } from '../../../shared/ui/logo/LogoBadge';

interface LoginFormProps {
  onSuccess?: () => void;
  isExpiredSession?: boolean;
}

export function LoginForm({ onSuccess, isExpiredSession = false }: LoginFormProps) {
  const { login, isLoading, error } = useAuth();
  const [isOffline, setIsOffline] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const sessionUser = await login(data);
      setIsSuccess(true);
      onSuccess?.();

      const userEmail = data.email.toLowerCase().trim();
      const isClasptekAdmin = userEmail === 'clasptek@gmail.com';
      const isAdminStaff = isClasptekAdmin || sessionUser?.roles?.some((r) =>
        ['ADMINISTRATOR', 'INSTRUCTOR', 'STAFF', 'SUPER_ADMIN'].includes(r)
      );

      if (typeof window !== 'undefined' && isClasptekAdmin) {
        localStorage.setItem('clasptek_user_role', 'ADMINISTRATOR');
        localStorage.setItem('clasptek_user_name', 'Clasptek Coaching Limited');
      }

      setTimeout(() => {
        if (isAdminStaff) {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }, 500);
    } catch {
      // Error handled by useAuth state
    }
  };

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-surface-1)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '0.85rem', display: 'flex', justifyContent: 'center' }}>
            <LogoBadge size="md" />
          </div>
          <h2
            style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}
          >
            Sign In — {BrandConfig.shortName}
          </h2>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Enter your academic credentials to access your portal workspace.
          </p>
        </div>

        {isExpiredSession && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '6px',
              color: '#fbbf24',
              fontSize: '0.85rem',
            }}
          >
            Your session has expired. Please sign in again.
          </div>
        )}

        {isOffline && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '6px',
              color: '#f87171',
              fontSize: '0.85rem',
            }}
          >
            Network offline. Please check your internet connection.
          </div>
        )}

        {error && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '6px',
              color: '#f87171',
              fontSize: '0.85rem',
            }}
          >
            {typeof error === 'object' ? error.message || JSON.stringify(error) : String(error)}
          </div>
        )}

        {isSuccess && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '6px',
              color: '#34d399',
              fontSize: '0.85rem',
              textAlign: 'center',
            }}
          >
            Authentication verified successfully! Redirecting...
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <Input
            label="Email Address"
            type="email"
            placeholder="student@clasptek.com"
            disabled={isLoading || isOffline}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading || isOffline}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            disabled={isLoading || isOffline || !isValid}
            style={{ marginTop: '0.5rem', width: '100%' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </Card>
  );
}
