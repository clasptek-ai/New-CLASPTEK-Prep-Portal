'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button, EmptyState, ClasptekLogo } from '../../components/ui/ui-components';
import { useNotification } from '../../providers/notification-provider';

export default function CareersPage() {
  const { showSuccess } = useNotification();

  return (
    <>
      <header className="shell-header" style={{ backgroundColor: 'var(--nav-bg)' }}>
        <Link href="/">
          <ClasptekLogo size="navbar" />
        </Link>
        <nav className="shell-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/about" style={{ color: 'var(--text-muted)' }}>About</Link>
          <Link href="/contact" style={{ color: 'var(--text-muted)' }}>Contact</Link>
          <Link href="/help" style={{ color: 'var(--text-muted)' }}>Help</Link>
          <Link href="/careers" style={{ color: 'var(--text-main)', fontWeight: 600 }}>Careers</Link>
          <Link href="/login">
            <Button variant="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Sign In</Button>
          </Link>
        </nav>
      </header>

      <main className="shell-main" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Careers at Clasptek</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Join our team in engineering the future of adaptive learning and global examinations.</p>
        </div>

        <div style={{ padding: '2rem 0' }}>
          <EmptyState
            title="No vacancies available"
            description="We do not have any open positions at the moment. However, we are always looking for talented educators, engineers, and support staff."
            actionText="Join Talent Community"
            onAction={() => showSuccess('Thank you for joining our talent community! We will notify you of future openings.')}
            illustrationType="generic"
          />
        </div>
      </main>

      <footer style={{ backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--card-border)', padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 'auto' }}>
        <p style={{ margin: '0 0 1rem 0' }}>&copy; {new Date().getFullYear()} Clasptek Global. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
        </div>
      </footer>
    </>
  );
}
