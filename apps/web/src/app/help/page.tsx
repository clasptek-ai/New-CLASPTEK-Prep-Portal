'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Accordion, Button, ClasptekLogo } from '../../components/ui/ui-components';

export default function HelpPage() {
  const categories = [
    {
      title: '🚀 Getting Started',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ margin: 0 }}>
            Welcome to Clasptek Prep Portal V2! To start your learning experience:
          </p>
          <ol style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
            <li>Register an account to set up your profile details.</li>
            <li>Explore available Academic Programmes and choose your curriculum stream.</li>
            <li>Launch diagnostic assessments to calculate your baseline score predictions.</li>
          </ol>
        </div>
      ),
    },
    {
      title: '👨‍🎓 Student Guide',
      content: (
        <p style={{ margin: 0 }}>
          Access your personalized dashboard to track score predictions, practice assignments, and
          launch mock exams. Engage with your personal AI Learning Coach for immediate interactive
          feedback on essays and grammar modifiers.
        </p>
      ),
    },
    {
      title: '👨‍🏫 Instructor Guide',
      content: (
        <p style={{ margin: 0 }}>
          Manage your cohorts, assign lessons, grade mock exams, and audit candidate progress. Use
          the Readiness tab to identify at-risk students and customize learning intervention
          strategies.
        </p>
      ),
    },
    {
      title: '⚙️ Administrator Guide',
      content: (
        <p style={{ margin: 0 }}>
          Monitor system operations, view logs, configure integrations, manage organizational
          tenants, and override configurations dynamically. Audit exam integrity metrics like
          browser blur events and pauses.
        </p>
      ),
    },
    {
      title: '📝 Assessment Guide',
      content: (
        <p style={{ margin: 0 }}>
          Clasptek provides diagnostic mock assessments mimicking official testing standards (IELTS,
          TOEFL, SAT, CELPIP). Timers are strictly enforced, and submissions are automatically
          analyzed by our specialized evaluation kernel.
        </p>
      ),
    },
    {
      title: '🛠️ Technical Support',
      content: (
        <p style={{ margin: 0 }}>
          For login problems, password reset failure, or connection issues, please email our support
          team at **support@clasptek-global.com** or chat on WhatsApp. Check our System Health logs
          inside the Operations Dashboard.
        </p>
      ),
    },
    {
      title: '❓ Frequently Asked Questions',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <strong>Q: Can I modify my answers after submitting a mock exam?</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
              A: No. Submitted mock exams are final. If you encountered technical difficulties,
              contact an administrator to re-run AI evaluation.
            </p>
          </div>
          <div>
            <strong>Q: How accurate is the exam readiness score?</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
              A: Our prediction engine uses historic benchmark data to calculate a score projection
              with 95% confidence intervals.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className="shell-header" style={{ backgroundColor: 'var(--nav-bg)' }}>
        <Link href="/">
          <ClasptekLogo size="navbar" />
        </Link>
        <nav className="shell-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/about" style={{ color: 'var(--text-muted)' }}>
            About
          </Link>
          <Link href="/contact" style={{ color: 'var(--text-muted)' }}>
            Contact
          </Link>
          <Link href="/help" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
            Help
          </Link>
          <Link href="/careers" style={{ color: 'var(--text-muted)' }}>
            Careers
          </Link>
          <Link href="/login">
            <Button variant="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Sign In
            </Button>
          </Link>
        </nav>
      </header>

      <main
        className="shell-main"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          padding: '3rem 1.5rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            Help Center & Guides
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Find step-by-step instructions, workspace manuals, and system FAQs.
          </p>
        </div>

        <Card title="Documentation Resources">
          <Accordion items={categories} />
        </Card>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginTop: '1rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              Still need assistance?
            </h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Connect with our global support desk for personalized help.
            </p>
          </div>
          <Link href="/contact">
            <Button>Contact Support</Button>
          </Link>
        </div>
      </main>

      <footer
        style={{
          backgroundColor: 'var(--card-bg)',
          borderTop: '1px solid var(--card-border)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          marginTop: 'auto',
        }}
      >
        <p style={{ margin: '0 0 1rem 0' }}>
          &copy; {new Date().getFullYear()} Clasptek Global. All rights reserved.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>
            Privacy Policy
          </Link>
          <Link href="/terms" style={{ color: 'var(--text-muted)' }}>
            Terms of Service
          </Link>
        </div>
      </footer>
    </>
  );
}
