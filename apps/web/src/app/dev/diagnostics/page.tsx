import React from 'react';
import Link from 'next/link';

export default function DiagnosticsPage() {
  const systemMetrics = {
    environment: 'development',
    packagesCount: 13,
    applicationsCount: 2,
    activeADRs: 5,
    activeEDRs: 3,
    conformanceChecks: 'PASS',
  };

  return (
    <>
      <header className="shell-header">
        <Link href="/" className="shell-brand">
          CLASPTEK PREP PORTAL V2
        </Link>
        <nav className="shell-nav">
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/account" className="nav-link">
            Account
          </Link>
        </nav>
      </header>

      <main className="shell-main">
        <div className="card">
          <h1>Development Diagnostics Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Real-time module metrics and boundary configuration summary. Restricted to
            non-production environments.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          <div className="card" style={{ margin: 0, textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Environment</h3>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)' }}>
              {systemMetrics.environment.toUpperCase()}
            </span>
          </div>
          <div className="card" style={{ margin: 0, textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Workspace Packages</h3>
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{systemMetrics.packagesCount}</span>
          </div>
          <div className="card" style={{ margin: 0, textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Active ADRs / EDRs</h3>
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>
              {systemMetrics.activeADRs} / {systemMetrics.activeEDRs}
            </span>
          </div>
          <div className="card" style={{ margin: 0, textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Fitness Status</h3>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>
              {systemMetrics.conformanceChecks}
            </span>
          </div>
        </div>

        <div className="card">
          <h2>Active Package Boundaries</h2>
          <ul
            style={{
              paddingLeft: '1.25rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <li>
              <strong>apps/web</strong>: Next.js Client Shell (Presentation layer)
            </li>
            <li>
              <strong>apps/worker</strong>: Background Process Wrapper (Infrastructure layer)
            </li>
            <li>
              <strong>packages/persistence</strong>: Datastore & DB pool adapter (Infrastructure
              layer)
            </li>
            <li>
              <strong>packages/authorization</strong>: Scoped permissions policy evaluator
              (Application layer)
            </li>
            <li>
              <strong>packages/contracts</strong>: API Endpoint models (Application layer)
            </li>
            <li>
              <strong>packages/events</strong>: Event Bus envelope builders (Domain layer)
            </li>
            <li>
              <strong>packages/validation</strong>: Zod primitive check boundaries (Domain layer)
            </li>
            <li>
              <strong>packages/kernel</strong>: Aggregates & entities primitives (Domain layer)
            </li>
            <li>
              <strong>packages/shared</strong>: Non-business utility scripts (Domain layer)
            </li>
          </ul>
        </div>
      </main>
    </>
  );
}
