'use client';

import React, { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthShell } from '../shell/AuthShell';

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset Your Password"
      subtitle="Enter a new secure password for your Clasptek account."
    >
      <Suspense
        fallback={
          <div className="py-12 flex items-center justify-center text-(--text-muted) font-semibold text-sm">
            Loading Password Reset...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
