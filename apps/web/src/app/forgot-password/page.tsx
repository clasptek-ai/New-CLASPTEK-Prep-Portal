'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthShell } from '../shell/AuthShell';
import { Button } from '../../shared/ui/button/Button';
import { Alert, AlertDescription, AlertTitle } from '../../shared/ui/alert/Alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to trigger recovery flow');
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your account email address to receive a secure recovery link."
    >
      {error && (
        <Alert variant="error" className="mb-4">
          <AlertTitle>Reset Request Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4">
          <AlertTitle>Recovery Link Sent</AlertTitle>
          <AlertDescription>
            A password reset email has been sent. Please check your inbox and follow the link to reset your password.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-(--text-secondary) mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-(--border) bg-(--surface-1) text-(--text-primary) text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-(--text-muted)"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          className="w-full justify-center mt-2"
        >
          Send Recovery Link
        </Button>
      </form>

      <div className="mt-5 text-center text-xs text-(--text-secondary)">
        Remembered your credentials?{' '}
        <Link href="/login" className="text-blue-500 font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </AuthShell>
  );
}
