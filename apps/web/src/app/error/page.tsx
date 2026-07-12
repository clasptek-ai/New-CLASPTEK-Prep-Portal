import React from 'react';
import Link from 'next/link';

export default function ErrorPage() {
  return (
    <main
      className="shell-main"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
    >
      <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--error)' }}>System Error</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1.5rem 0' }}>
          An unexpected error occurred. A secure incident reference has been logged.
        </p>
        <Link href="/" className="btn" style={{ display: 'inline-block' }}>
          Return to Safety
        </Link>
      </div>
    </main>
  );
}
