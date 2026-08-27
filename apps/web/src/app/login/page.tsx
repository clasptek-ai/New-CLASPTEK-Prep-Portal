'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthShell } from '../shell/AuthShell';
import { LoginForm } from '../../features/auth/login';
import { Alert, AlertDescription, AlertTitle } from '../../shared/ui/alert/Alert';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const sessionTimeout = searchParams.get('timeout') === 'true';
  const signedOut =
    searchParams.get('signedOut') === 'true' || searchParams.get('logout') === 'true';
  const emailConfirmed = searchParams.get('confirmed') === '1';
  const confirmationFailed = searchParams.get('error') === 'confirmation_failed';

  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to continue your Clasptek learning portal.">
      {emailConfirmed && (
        <Alert variant="success" className="mb-4">
          <AlertTitle>Email Confirmed</AlertTitle>
          <AlertDescription>
            Your email has been confirmed successfully. Please sign in to access your account.
          </AlertDescription>
        </Alert>
      )}

      {confirmationFailed && (
        <Alert variant="warning" className="mb-4">
          <AlertTitle>Confirmation Failed</AlertTitle>
          <AlertDescription>
            Your email confirmation link may have expired or already been used. Please request a new
            confirmation email or contact support.
          </AlertDescription>
        </Alert>
      )}

      {sessionTimeout && (
        <Alert variant="warning" className="mb-4">
          <AlertTitle>Session Expired</AlertTitle>
          <AlertDescription>
            Your login session has timed out. Please sign in again.
          </AlertDescription>
        </Alert>
      )}

      {signedOut && (
        <Alert variant="success" className="mb-4">
          <AlertTitle>Signed Out</AlertTitle>
          <AlertDescription>You have been signed out successfully.</AlertDescription>
        </Alert>
      )}

      <LoginForm />

      <div className="flex justify-between items-center text-xs mt-4">
        <Link href="/forgot-password" className="text-blue-500 hover:underline font-medium">
          Forgot Password?
        </Link>
        <span className="text-slate-400">
          New to Clasptek?{' '}
          <Link href="/register" className="text-blue-500 font-bold hover:underline">
            Create Account
          </Link>
        </span>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-400">
          Loading Portal...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
