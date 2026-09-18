'use client';

import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { AuthShell } from '../shell/AuthShell';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create Student Account"
      subtitle="Prepare for IELTS, TOEFL, SAT and CELPIP with personalized AI-powered learning."
      maxWidth="620px"
    >
      <RegisterForm />

      <div className="mt-6 text-center text-xs text-(--text-secondary)">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-(--brand-light) hover:underline font-bold transition-colors inline-flex items-center gap-1"
        >
          <span>Sign In</span>
          <span>→</span>
        </Link>
      </div>
    </AuthShell>
  );
}
