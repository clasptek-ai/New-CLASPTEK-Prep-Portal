'use client';

import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { AuthShell } from '../shell/AuthShell';

export default function RegisterPage() {
  return (
    <AuthShell
      title="CREATE YOUR PREP PORTAL ACCOUNT"
      subtitle="Create your account to access Clasptek assessments, mock examinations, results and progress tracking."
      maxWidth="640px"
    >
      <RegisterForm />

      <div className="mt-6 text-center text-xs text-[#475569]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-[#045EAD] hover:text-brand-hover hover:underline font-bold transition-colors inline-flex items-center gap-1 no-underline"
        >
          <span>SIGN IN</span>
          <span>→</span>
        </Link>
      </div>
    </AuthShell>
  );
}
