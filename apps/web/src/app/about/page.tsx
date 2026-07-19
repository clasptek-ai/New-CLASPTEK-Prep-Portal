'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button, ClasptekLogo } from '../../components/ui/ui-components';

export default function AboutPage() {
  return (
    <>
      <header className="shell-header" style={{ backgroundColor: 'var(--nav-bg)' }}>
        <Link href="/">
          <ClasptekLogo size="navbar" />
        </Link>
        <nav className="shell-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/about" style={{ color: 'var(--text-main)', fontWeight: 600 }}>About</Link>
          <Link href="/contact" style={{ color: 'var(--text-muted)' }}>Contact</Link>
          <Link href="/help" style={{ color: 'var(--text-muted)' }}>Help</Link>
          <Link href="/careers" style={{ color: 'var(--text-muted)' }}>Careers</Link>
          <Link href="/login">
            <Button variant="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Sign In</Button>
          </Link>
        </nav>
      </header>

      <main className="shell-main" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>About Clasptek</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>Empowering global candidates with adaptive learning technology and AI-driven assessments.</p>
        </div>

        <Card title="Our Vision & Mission">
          <p style={{ lineHeight: 1.7, margin: 0, color: 'var(--text-muted)' }}>
            Clasptek is a pioneer in global academic preparation and assessment solutions. Our mission is to bridge the gap between candidate aspirations and academic/professional validation. Through personalized AI-powered training, predictive exam readiness, and real-time coaching diagnostics, we deliver a standardized pathway to international excellence.
          </p>
        </Card>

        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Our Core Academies</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <Card title="Technology & Innovation">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Focusing on modern architectures, cloud engineering, and dynamic software development validation.</p>
            </Card>
            <Card title="Business & Management">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Empowering candidates with strategic analytics, execution frameworks, and operation credentials.</p>
            </Card>
            <Card title="Career Development">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Interview masterclasses, personal branding, resume diagnostics, and professional placement training.</p>
            </Card>
            <Card title="Global Exam Preparation">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Authoritative mock tests and adaptive study pathways for IELTS, TOEFL, SAT, and CELPIP exams.</p>
            </Card>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/register">
            <Button>Get Started Today</Button>
          </Link>
        </div>
      </main>

      <footer style={{ backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--card-border)', padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p style={{ margin: '0 0 1rem 0' }}>&copy; {new Date().getFullYear()} Clasptek Global. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
        </div>
      </footer>
    </>
  );
}
