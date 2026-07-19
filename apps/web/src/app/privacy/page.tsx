'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button, ClasptekLogo } from '../../components/ui/ui-components';

export default function PrivacyPage() {
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
          <Link href="/careers" style={{ color: 'var(--text-muted)' }}>Careers</Link>
          <Link href="/login">
            <Button variant="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Sign In</Button>
          </Link>
        </nav>
      </header>

      <main className="shell-main" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Last updated: July 17, 2026</p>
        </div>

        <Card title="1. Information We Collect">
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            We collect personal details (e.g. name, email, credentials) when you register on our portal, alongside diagnostic performance records, response answers inputs, mock exam timings, and browser tab active states to validate academic integrity.
          </p>
        </Card>

        <Card title="2. How We Use Information">
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Your information is processed to calculate learning readiness metrics, dispatch notifications, offer customized study recommendations, and enable automated assessment evaluations.
          </p>
        </Card>

        <Card title="3. Cookies & Tracking">
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            We use secure cookies and local storage tokens to manage auth sessions and cache preference configurations dynamically.
          </p>
        </Card>
      </main>

      <footer style={{ backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--card-border)', padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 'auto' }}>
        <p style={{ margin: '0 0 1rem 0' }}>&copy; {new Date().getFullYear()} Clasptek Global. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link href="/privacy" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
        </div>
      </footer>
    </>
  );
}
