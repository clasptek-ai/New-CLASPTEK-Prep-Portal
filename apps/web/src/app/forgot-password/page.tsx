'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthShell } from '../shell/AuthShell';
import { Alert, AlertDescription, AlertTitle } from '../../shared/ui/alert/Alert';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

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
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Unable to process password recovery request. Please verify your email.');
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="RESET YOUR PASSWORD"
      subtitle="Enter your account email address to receive a secure recovery link to reset your password."
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
            A secure recovery link has been dispatched to your email address. Please check your inbox and spam folder.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="recovery-email" className="block text-xs font-bold text-deep-navy mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none"
            />
            <input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 h-11 rounded-lg border border-slate-300 bg-white text-deep-navy text-sm focus:outline-none focus:ring-2 focus:ring-[#045EAD] focus:border-[#045EAD] transition-all placeholder:text-[#64748B]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full h-11 bg-[#045EAD] hover:bg-brand-hover text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#045EAD] cursor-pointer shadow-sm mt-2"
        >
          <span>{loading ? 'SENDING RECOVERY LINK...' : 'SEND RECOVERY LINK'}</span>
          <ArrowRight size={14} />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[#475569]">
        Remembered your credentials?{' '}
        <Link
          href="/login"
          className="text-[#045EAD] hover:text-brand-hover font-bold hover:underline transition-colors no-underline inline-flex items-center gap-1"
        >
          <span>SIGN IN</span>
          <span>→</span>
        </Link>
      </div>
    </AuthShell>
  );
}
