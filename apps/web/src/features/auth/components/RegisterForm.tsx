'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '../schemas/auth.schemas';
import { useAuth } from '../hooks/useAuth';
import { Input, Button, Card } from '../../../components/ui/ui-components';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register: registerAuth, isLoading, error } = useAuth();
  const [isOffline, setIsOffline] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerAuth({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      setIsSuccess(true);
      onSuccess?.();
    } catch {
      // Error handled by hook state
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
        <div>
          <h2
            style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}
          >
            Create Student Account
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Join Clasptek Prep Portal to access diagnostic assessments and study plans.
          </p>
        </div>

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
            }}
          >
            Registration completed! Please check your email or log in.
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="First Name"
              placeholder="Sarah"
              disabled={isLoading || isOffline}
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last Name"
              placeholder="Jenkins"
              disabled={isLoading || isOffline}
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="sarah@example.com"
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
            {isLoading ? 'Registering Account...' : 'Create Account'}
          </Button>
        </form>
      </div>
    </Card>
  );
}
