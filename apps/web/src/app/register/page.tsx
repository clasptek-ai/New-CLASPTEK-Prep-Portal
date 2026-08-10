'use client';

import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 font-sans antialiased">
      {/* Top Header: Logo */}
      <div className="mb-6 sm:mb-8 flex justify-center">
        <Link
          href="/"
          className="no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        >
          <LogoBadge size="lg" />
        </Link>
      </div>

      {/* Main Centered Registration Card Container (480px - 540px width) */}
      <div className="w-full max-w-[540px]">
        <RegisterForm />
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 text-center text-sm text-slate-400">
        <p className="m-0">
          Already registered?{' '}
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 font-semibold no-underline transition-colors focus:outline-none focus:underline"
          >
            Sign In to Learning Portal →
          </Link>
        </p>
      </div>
    </div>
  );
}
