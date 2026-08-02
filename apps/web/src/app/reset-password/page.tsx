'use client';

import React, { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center text-slate-400 font-semibold text-sm">
            Loading Password Reset Experience...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
