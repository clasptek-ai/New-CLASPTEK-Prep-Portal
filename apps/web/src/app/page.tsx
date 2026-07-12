import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <header className="shell-header">
        <div className="shell-brand">CLASPTEK PREP PORTAL V2</div>
        <nav className="shell-nav">
          <Link href="/login" className="nav-link">
            Sign In
          </Link>
          <Link href="/register" className="nav-link">
            Register
          </Link>
          <Link href="/account" className="nav-link">
            My Account
          </Link>
          <Link href="/dev/diagnostics" className="nav-link">
            Dev Diagnostics
          </Link>
        </nav>
      </header>

      <main className="shell-main">
        <div className="card">
          <h1>Sprint 1.1 — Project Foundation</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            The production repository, workspace configurations, build pipelines, coding governance
            rules, and strict import boundary controls are active.
          </p>
          <div
            style={{
              marginTop: '2rem',
              borderLeft: '4px solid var(--accent)',
              paddingLeft: '1rem',
            }}
          >
            <h3 style={{ margin: 0, color: 'var(--accent)' }}>System Status: Operational</h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
              Monorepo initialized. Direct database operations, academic dashboards, and assessment
              kernels remain blocked to preserve architecture discipline.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
          }}
        >
          <div className="card" style={{ margin: 0 }}>
            <h2>Governance Rules</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Strict dependency layering is validated on every commit. No circular references,
              cross-domain domain leakage, or server modules in browser files.
            </p>
            <Link href="/dev/diagnostics" style={{ fontWeight: 600 }}>
              Inspect Boundaries &rarr;
            </Link>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <h2>Identity & Access</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Bootstrap authentication controls are registered. Registration, reset recovery, and
              device tracking UI shells are ready.
            </p>
            <Link href="/register" style={{ fontWeight: 600 }}>
              View Auth Shells &rarr;
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
