'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function ErrorForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawCode = searchParams ? searchParams.get('code') || '500' : '500';
  const code = rawCode.toUpperCase();

  const getErrorContent = () => {
    switch (code) {
      case 'UNAUTHORIZED':
      case 'UNAUTHENTICATED':
      case '401':
        return {
          codeDisplay: '401',
          title: '401 — Unauthorized Session',
          desc: 'Your active session details could not be validated or have expired. Please authenticate to access your secure portal workspace.',
          cta: 'Sign In',
          href: '/login',
        };
      case 'FORBIDDEN':
      case '403':
        return {
          codeDisplay: '403',
          title: '403 — Workspace Access Forbidden',
          desc: 'Your account profile does not possess permissions to access this administrative or student workspace resource.',
          cta: 'Return Home',
          href: '/',
        };
      case 'NOT_FOUND':
      case '404':
        return {
          codeDisplay: '404',
          title: '404 — Resource Not Found',
          desc: 'The requested portal page or API resource does not exist or has been relocated.',
          cta: 'Return Home',
          href: '/',
        };
      case 'OFFLINE':
        return {
          codeDisplay: 'OFFLINE',
          title: 'Connection Offline',
          desc: 'You are currently disconnected from the network. Please verify your internet connection and try again.',
          cta: 'Retry Connection',
          href: '',
        };
      case 'MAINTENANCE':
        return {
          codeDisplay: 'MAINTENANCE',
          title: 'Under System Maintenance',
          desc: 'We are currently upgrading the Clasptek academic database and evaluation engines.',
          cta: 'Help Center',
          href: '/help',
        };
      case 'SERVER_ERROR':
      case '500':
      default:
        return {
          codeDisplay: '500',
          title: '500 — System Operation Error',
          desc: 'An unexpected server operation failed. A secure incident reference has been recorded.',
          cta: 'Return to Safety',
          href: '/',
        };
    }
  };

  const err = getErrorContent();

  const handleCTA = () => {
    try {
      if (code === 'OFFLINE') {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        router.push(err.href);
      }
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = err.href || '/';
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--surface-0)',
        color: 'var(--text-primary)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <header
        style={{
          padding: '1.25rem 2rem',
          backgroundColor: 'var(--surface-1)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            color: 'var(--text-primary)',
            fontWeight: 800,
            fontSize: '1.25rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ color: 'var(--brand-primary)' }}>CLASPTEK</span> GLOBAL
        </Link>
      </header>

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '2.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1
            style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            {err.title}
          </h1>
          <p
            style={{
              margin: '0 0 2rem 0',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}
          >
            {err.desc}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleCTA}
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
            >
              {err.cta}
            </button>
            <button
              onClick={() => {
                try {
                  router.push('/help');
                } catch {
                  if (typeof window !== 'undefined') window.location.href = '/help';
                }
              }}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Technical Support
            </button>
          </div>
        </div>
      </main>

      <footer
        style={{
          backgroundColor: 'var(--surface-0)',
          borderTop: '1px solid var(--border)',
          padding: '1.25rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}
      >
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} Clasptek Global. Platform Version 2.0.0-RC1.
        </p>
      </footer>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--surface-0)',
            color: 'var(--text-primary)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Loading System Diagnostics...
        </div>
      }
    >
      <ErrorForm />
    </Suspense>
  );
}
