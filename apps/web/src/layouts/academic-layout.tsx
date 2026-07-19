'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authoringNavigation } from '../navigation/authoring.navigation';
import { useTheme } from '../providers/theme-provider';
import { RouteGuard } from '../components/auth/route-guard';

export function AcademicStudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('Central Academic Repository');

  const notifications = [
    { title: 'Draft Rejected', body: 'Question #120 Grammar Modifiers rejected by reviewer Jane Smith', time: '10m ago' },
    { title: 'Review Requested', body: 'Programme IELTS prep draft submitted for outcome validation review', time: '1h ago' }
  ];

  return (
    <RouteGuard allowedRoles={['ADMINISTRATOR', 'INSTRUCTOR']}>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--text-main)' }}>
        {/* Collapsible Sidebar */}
        <aside
          style={{
            width: collapsed ? '80px' : '280px',
            backgroundColor: '#0f172a',
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
              <span style={{ fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Authoring Studio
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1rem',
                margin: collapsed ? '0 auto' : '0'
              }}
              title={collapsed ? 'Expand menu' : 'Collapse menu'}
            >
              {collapsed ? '▶' : '◀'}
            </button>
          </div>

          {/* Workspace Switcher */}
          {!collapsed && (
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Active Workspace</label>
              <select
                value={activeWorkspace}
                onChange={(e) => setActiveWorkspace(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  border: '1px solid #1e293b',
                  backgroundColor: '#020617',
                  color: '#cbd5e1',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <option value="Central Academic Repository">Central Academic Repository</option>
                <option value="Experimental Sandboxed Drafts">Experimental Sandboxed Drafts</option>
              </select>
            </div>
          )}

          {/* Nav list */}
          <nav style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
            {authoringNavigation.map((item, idx) => {
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
                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  title={item.name}
                >
                  <span style={{ fontSize: '1rem' }}>✎</span>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Studio body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <header
            style={{
              height: '64px',
              backgroundColor: '#0f172a',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2rem',
              boxSizing: 'border-box'
            }}
          >
            {/* Breadcrumbs */}
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Studio Workspace</span>
              <span>&rarr;</span>
              <span style={{ color: '#cbd5e1' }}>
                {pathname ? pathname.replace('/authoring/', '').toUpperCase() : 'DASHBOARD'}
              </span>
            </div>

            {/* Quick Search palette & notifications bell */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative' }}>
              <input
                placeholder="🔍 Studio Command Search..."
                onClick={() => setSearchOpen(true)}
                readOnly
                style={{
                  width: '220px',
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
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  position: 'relative'
                }}
              >
                🔔
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} />
              </button>

              {notificationsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: '40px',
                    width: '320px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    padding: '1rem',
                    zIndex: 100
                  }}
                >
                  <h4 style={{ margin: '0 0 0.75rem 0', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>Content Notifications</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {notifications.map((n, i) => (
                      <div key={i} style={{ fontSize: '0.8rem' }}>
                        <strong style={{ display: 'block', color: '#10b981' }}>{n.title}</strong>
                        <span style={{ color: '#cbd5e1' }}>{n.body}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>
                  <span>A</span>
                </div>
              </div>
            </div>
          </header>

          <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', boxSizing: 'border-box' }}>
            {children}
          </main>
        </div>

        {/* Global Command Search Overlay */}
        {searchOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(11, 15, 25, 0.7)',
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
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                padding: '1rem'
              }}
              onClick={e => e.stopPropagation()}
            >
              <input
                autoFocus
                placeholder="Search programmes, curriculum modules, lessons sequencing, question bank drafts..."
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
                Press ESC to close search overlay
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
export default AcademicStudioLayout;
