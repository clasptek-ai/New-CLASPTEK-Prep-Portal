'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  BarChart2,
  GraduationCap,
  Bot,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { StudentBottomNav } from '@/shared/ui/navigation/StudentBottomNav';
import { MobileNavDrawer } from '@/shared/ui/navigation/MobileNavDrawer';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import { useGlobalLogout } from '@/features/auth/hooks/useGlobalLogout';
import { LogoutConfirmModal } from '@/components/auth/LogoutConfirmModal';

interface StudentLayoutProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { label: 'Dashboard',             href: '/dashboard',           icon: LayoutDashboard },
  { label: 'My Assessments',        href: '/student/assessments', icon: BookOpen },
  { label: 'Practice',              href: '/student/practice',    icon: Dumbbell },
  { label: 'Results',               href: '/student/results',     icon: BarChart2 },
  { label: 'Learning',              href: '/learning',            icon: GraduationCap },
  { label: 'AI Learning Assistant', href: '/learning-assistant',  icon: Bot },
  { label: 'Notifications',         href: '/notifications',       icon: Bell },
  { label: 'Profile',               href: '/profile',             icon: User },
];

export function StudentLayout({ children }: StudentLayoutProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { handleLogout, isConfirmOpen, cancelLogout, confirmLogout, isLoggingOut } =
    useGlobalLogout();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/student';
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Mobile Top Bar ── */}
      <header
        className="md:hidden"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-header)' as React.CSSProperties['zIndex'],
          height: 'var(--header-height)',
          backgroundColor: 'var(--surface-0)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            style={{
              width: 'var(--touch-target-min)',
              height: 'var(--touch-target-min)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
            }}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <LogoBadge size="sm" href="/dashboard" ariaLabel="Go to Student Dashboard" />
        </div>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'var(--brand-light)',
            backgroundColor: 'var(--brand-subtle)',
            border: '1px solid var(--brand-border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.2rem 0.65rem',
          }}
        >
          Student
        </span>
      </header>

      {/* ── Main Content + Sidebar ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Desktop Sidebar ── */}
        <aside
          className="hidden md:flex"
          style={{
            flexDirection: 'column',
            width: sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
            flexShrink: 0,
            height: '100vh',
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--surface-0)',
            borderRight: '1px solid var(--border)',
            transition: 'width var(--duration-normal) var(--ease-in-out)',
            zIndex: 'var(--z-sidebar)' as React.CSSProperties['zIndex'],
            overflow: 'hidden',
          }}
        >
          {/* Sidebar Header */}
          <div
            style={{
              height: 'var(--header-height)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between',
              padding: sidebarCollapsed ? '0' : '0 0.875rem 0 1rem',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            {!sidebarCollapsed && (
              <LogoBadge size="sm" href="/dashboard" ariaLabel="Go to Student Dashboard" />
            )}
            <button
              onClick={() => setSidebarCollapsed((p) => !p)}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                flexShrink: 0,
              }}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Nav Items */}
          <nav
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
            aria-label="Student Navigation"
          >
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={sidebarCollapsed ? link.label : undefined}
                  className="nav-link"
                  style={{
                    color: active ? 'var(--brand-light)' : undefined,
                    backgroundColor: active ? 'var(--brand-subtle)' : undefined,
                    fontWeight: active ? 600 : undefined,
                    justifyContent: sidebarCollapsed ? 'center' : undefined,
                    paddingLeft: sidebarCollapsed ? '0' : undefined,
                    paddingRight: sidebarCollapsed ? '0' : undefined,
                  }}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '20%',
                        bottom: '20%',
                        width: '3px',
                        borderRadius: '0 4px 4px 0',
                        backgroundColor: 'var(--brand-light)',
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    size={18}
                    style={{
                      color: active ? 'var(--brand-light)' : 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  />
                  {!sidebarCollapsed && (
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div
            style={{
              padding: '0.5rem',
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={handleLogout}
              title={sidebarCollapsed ? 'Sign Out' : undefined}
              className="nav-link"
              style={{
                color: 'var(--error)',
                width: '100%',
                justifyContent: sidebarCollapsed ? 'center' : undefined,
              }}
              aria-label="Sign Out of Student Portal"
            >
              <LogOut size={18} style={{ flexShrink: 0, color: 'var(--error)' }} />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: 'var(--spacing-page)',
            paddingBottom: 'calc(var(--bottom-nav-height) + var(--spacing-page))',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile Drawer ── */}
      <MobileNavDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        onLogout={handleLogout}
        title="Student Portal"
        links={NAV_LINKS}
        userRole="Student"
        logoHref="/dashboard"
      />

      {/* ── Mobile Bottom Nav ── */}
      <StudentBottomNav />

      {/* ── Logout Confirm Modal ── */}
      <LogoutConfirmModal
        isOpen={isConfirmOpen}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
}
