'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLoginForm } from './login.hooks';
import {
  FormField,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form/form-primitives';
import { Input, PasswordInput } from '../../../shared/ui/input/Input';
import { Alert, AlertDescription } from '../../../shared/ui/alert/Alert';

export function LoginForm() {
  const { form, serverError, isSubmitting, onSubmit } = useLoginForm();
  const [rememberMe, setRememberMe] = useState(true);
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form method="POST" onSubmit={onSubmit} noValidate className="w-full space-y-4">
      {serverError && (
        <Alert variant="error" className="mb-4">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <FormField>
        <FormLabel htmlFor="login-email" required>
          Email Address
        </FormLabel>
        <Input
          id="login-email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormMessage id="login-email-error" error={errors.email?.message} />
      </FormField>

      <FormField>
        <div className="flex items-center justify-between mb-1">
          <FormLabel htmlFor="login-password" required>
            Password
          </FormLabel>
          <Link
            href="/forgot-password"
            className="text-xs text-[#003c90] hover:text-[#002c6b] hover:underline font-medium no-underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="login-password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormMessage id="login-password-error" error={errors.password?.message} />
      </FormField>

      {/* Remember me toggle */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="remember-me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-[#003c90] focus:ring-[#003c90] cursor-pointer"
        />
        <label htmlFor="remember-me" className="text-xs text-[#545f73] cursor-pointer select-none">
          Remember me on this device
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-[#003c90] hover:bg-[#002c6b] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#003c90] cursor-pointer shadow-sm mt-2"
      >
        <span>{isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}</span>
      </button>
    </form>
  );
}
