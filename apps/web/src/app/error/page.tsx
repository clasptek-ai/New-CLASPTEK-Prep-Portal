'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Button, ClasptekLogo } from '../../components/ui/ui-components';

function ErrorForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code') || '500';

  const getErrorContent = () => {
    switch (code) {
      case '401':
        return {
          title: '401 — Unauthorized Session',
          desc: 'Your active session details could not be validated. Please authenticate to access this secure workspace.',
          cta: 'Sign In',
          href: '/login'
        };
      case '403':
        return {
          title: '403 — Workspace Forbidden',
          desc: 'Your account profile does not possess permissions to access this administrative workspace resource.',
          cta: 'Back to Safety',
          href: '/'
        };
      case '404':
        return {
          title: '404 — Page Not Found',
          desc: 'The requested portal page resource does not exist or has been relocated.',
          cta: 'Return Home',
          href: '/'
        };
      case 'offline':
        return {
          title: 'Connection Offline',
          desc: 'You are disconnected from the network. Please verify your internet connection and try again.',
          cta: 'Retry Connection',
          href: ''
        };
      case 'maintenance':
        return {
          title: 'Under System Maintenance',
          desc: 'We are currently upgrading the Clasptek databases and academic kernels. Public routes are locked.',
          cta: 'Help Center',
          href: '/help'
        };
      default:
        return {
          title: '500 — Academic Kernel Failure',
          desc: 'An unexpected server operation failed. A secure incident reference correlation ID has been logged.',
          cta: 'Return to Safety',
          href: '/'
        };
    }
  };

  const err = getErrorContent();

  const handleCTA = () => {
    if (code === 'offline') {
      window.location.reload();
    } else {
      router.push(err.href);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <header className="shell-header" style={{ backgroundColor: 'var(--nav-bg)' }}>
        <Link href="/">
          <ClasptekLogo size="navbar" />
        </Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <Card title={<span style={{ color: 'var(--error)', fontSize: '1.25rem', fontWeight: 800 }}>⚠️ {err.title}</span>} style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', margin: '1.5rem 0', lineHeight: 1.6 }}>
            {err.desc}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button onClick={handleCTA}>
              {err.cta}
            </Button>
            <Button variant="secondary" onClick={() => router.push('/help')}>
              Technical Support
            </Button>
          </div>
        </Card>
      </main>

      <footer style={{ backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--card-border)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Clasptek Global. Platform Version 2.0.0-RC1.</p>
      </footer>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19', color: '#ffffff' }}>Loading System Diagnostics...</div>}>
      <ErrorForm />
    </Suspense>
  );
}
