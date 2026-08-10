'use client';

import React from 'react';
import { AdminWorkspaceProvider } from '../../workspace/AdminWorkspaceContext';
import { RBACGuard } from '../../shared/auth/rbac-guard';
import { AdminSidebar } from './components/admin-sidebar';
import { AdminHeader } from './components/admin-header';

/**
 * Production Viewport Dashboard Layout (Linear / Stripe / Vercel style)
 *
 * Security Architecture:
 * - RBACGuard is at the top level to ensure unpermitted users (e.g. Students) receive
 *   a clean HTTP 403 Forbidden screen WITHOUT mounting AdminWorkspaceProvider or triggering admin APIs.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RBACGuard>
      <AdminWorkspaceProvider>
        <div
          style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            maxHeight: '100vh',
            maxWidth: '100vw',
            backgroundColor: 'var(--bg-app, #0b0f19)',
            color: 'var(--text-primary, #f8fafc)',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {/* Persistent Desktop Sidebar */}
          <AdminSidebar />

          {/* Main Content Workspace Column */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              minWidth: 0,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* Top Operational Header Bar */}
            <AdminHeader />

            {/* Scrollable Main Workspace Region */}
            <main
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '1.5rem',
                width: '100%',
                maxWidth: '1600px',
                margin: '0 auto',
                boxSizing: 'border-box',
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </AdminWorkspaceProvider>
    </RBACGuard>
  );
}
