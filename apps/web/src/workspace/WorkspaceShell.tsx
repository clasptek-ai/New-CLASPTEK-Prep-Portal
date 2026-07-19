'use client';

import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { WorkspaceContext } from './WorkspaceContext';
import { WorkspaceId, workspaceRegistry } from './workspace-registry';
import { RouteGuard } from '../components/auth/route-guard';

interface WorkspaceShellProps {
  workspaceRole: WorkspaceId;
  children: React.ReactNode;
}

export function WorkspaceShell({ workspaceRole, children }: WorkspaceShellProps) {
  const context = useContext(WorkspaceContext);
  const pathname = usePathname();
  const router = useRouter();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  if (!context) {
    throw new Error('WorkspaceShell must be wrapped in WorkspaceProvider context');
  }

  const { currentWorkspace, setWorkspaceId, preferences, updatePreferences } = context;

  // Force active workspace synchronisation
  useEffect(() => {
    if (currentWorkspace.id !== workspaceRole) {
      setWorkspaceId(workspaceRole);
    }
  }, [workspaceRole, currentWorkspace.id, setWorkspaceId]);

  const activeTheme = preferences.theme;
  const collapsed = preferences.sidebarCollapsed;

  const handleSwitch = (id: WorkspaceId) => {
    setWorkspaceId(id);
    setSwitcherOpen(false);
    // Dynamic redirect mapping
    const target = workspaceRegistry[id];
    router.push(target.defaultRoute);
  };

  return (
    <RouteGuard allowedRoles={workspaceRole === 'STUDENT' ? ['STUDENT'] : workspaceRole === 'ADMIN' ? ['ADMINISTRATOR'] : ['INSTRUCTOR', 'ADMINISTRATOR']}>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--text-main)', accentColor: currentWorkspace.themeAccent }}>
        
        {/* Dynamic Sidebar navigation */}
        <aside
          style={{
            width: collapsed ? '80px' : '280px',
            backgroundColor: '#0b0f19',
            borderRight: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            transition: 'width 0.2s ease'
          }}
        >
          {/* Brand header */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {!collapsed && (
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${currentWorkspace.themeAccent}, #a855f7)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {currentWorkspace.name}
              </span>
            )}
            <button
              onClick={() => updatePreferences({ sidebarCollapsed: !collapsed })}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', margin: collapsed ? '0 auto' : '0' }}
            >
              {collapsed ? '▶' : '◀'}
            </button>
          </div>

          {/* Quick switcher panel */}
          {!collapsed && (
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Switch Workspace</label>
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #1e293b',
                  backgroundColor: '#020617',
                  color: '#cbd5e1',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {currentWorkspace.name} ▾
              </button>

              {switcherOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '60px',
                    left: '20px',
                    right: '20px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    zIndex: 100,
                    padding: '0.5rem'
                  }}
                >
                  {(Object.keys(workspaceRegistry) as WorkspaceId[]).map(id => (
                    <button
                      key={id}
                      onClick={() => handleSwitch(id)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: currentWorkspace.id === id ? currentWorkspace.themeAccent : '#cbd5e1',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {workspaceRegistry[id].name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Nav link registry items */}
          <nav style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
            {currentWorkspace.navigation.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#f8fafc' : '#94a3b8',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    border: isActive ? `1px solid ${currentWorkspace.themeAccent}` : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>⚙</span>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Work Surface */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <header
            style={{
              height: '64px',
              backgroundColor: '#0b0f19',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2rem',
              boxSizing: 'border-box'
            }}
          >
            {/* Breadcrumbs */}
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
              <span>Workspace</span>
              <span>&rarr;</span>
              <span style={{ color: '#cbd5e1' }}>
                {pathname ? pathname.replace('/instructor/', '').replace('/admin/', '').replace('/authoring/', '').toUpperCase() : 'DASHBOARD'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                placeholder={`Search ${currentWorkspace.searchScope}...`}
                onClick={() => setSearchOpen(true)}
                readOnly
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #1e293b',
                  backgroundColor: '#020617',
                  color: '#cbd5e1',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              />
              <button
                onClick={() => updatePreferences({ theme: activeTheme === 'dark' ? 'light' : 'dark' })}
                style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '1rem' }}
              >
                {activeTheme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </header>

          <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
            {children}
          </main>
        </div>

        {/* Unified Search Command Palette Overlay */}
        {searchOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(2, 6, 23, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              paddingTop: '10vh',
              zIndex: 1000
            }}
            onClick={() => setSearchOpen(false)}
          >
            <div
              style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '1rem'
              }}
              onClick={e => e.stopPropagation()}
            >
              <input
                autoFocus
                placeholder={`Fuzzy search ${currentWorkspace.searchScope} registries...`}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #1e293b',
                  backgroundColor: '#020617',
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                Searching workspace context: **{currentWorkspace.id}**
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
export default WorkspaceShell;
