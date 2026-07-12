import React from 'react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <main
      className="shell-main"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
    >
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h2>Verify Email</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '1.5rem 0' }}>
          We have sent a verification code to your registered email address. This is currently
          simulated under the Sprint 1.1 Project Foundation.
        </p>
        <Link href="/login" className="btn" style={{ display: 'inline-block' }}>
          Return to Sign In
        </Link>
      </div>
    </main>
  );
}
