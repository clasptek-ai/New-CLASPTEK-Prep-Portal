'use client';

import React from 'react';
import { AdminWorkspaceProvider } from '../../workspace/AdminWorkspaceContext';
import { RBACGuard } from '../../shared/auth/rbac-guard';
import { AdminSidebar } from './components/admin-sidebar';
import { AdminHeader } from './components/admin-header';

/**
 * Production Viewport Dashboard Layout (Linear / Stripe / Vercel style)
 *
 * Layout Principles:
 * - Root Container: Fixed 100vh / 100vw, overflow: hidden (NO root page horizontal scroll).
 * - AdminSidebar: Fixed height 100vh, independent overflowY: auto.
 * - Right Area: Flex-1, minWidth: 0, overflow: hidden.
 * - AdminHeader: Fixed height 64px, full width of main workspace.
 * - Main Workspace: flex: 1, overflowY: auto, overflowX: hidden. Only table wrappers scroll horizontally when necessary.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminWorkspaceProvider>
      <RBACGuard>
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
      </RBACGuard>
    </AdminWorkspaceProvider>
  );
}
