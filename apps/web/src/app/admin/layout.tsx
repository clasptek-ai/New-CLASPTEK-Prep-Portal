'use client';

import React from 'react';
import { AdminWorkspaceProvider } from '../../workspace/AdminWorkspaceContext';
import { RBACGuard } from '../../shared/auth/rbac-guard';
import { AdminSidebar } from './components/admin-sidebar';
import { AdminHeader } from './components/admin-header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminWorkspaceProvider>
      <RBACGuard>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100%',
            backgroundColor: 'var(--bg-app, #0b0f19)',
            color: 'var(--text-primary, #f8fafc)',
            overflowX: 'hidden',
          }}
        >
          {/* Persistent Desktop Sidebar (Collapsible on tablet, drawer on mobile) */}
          <AdminSidebar />

          {/* Main Content Area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              boxSizing: 'border-box',
            }}
          >
            {/* Top Operational Header Bar */}
            <AdminHeader />

            {/* Workspace Page Area */}
            <main
              style={{
                flex: 1,
                padding: '2rem',
                maxWidth: '1440px',
                width: '100%',
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
