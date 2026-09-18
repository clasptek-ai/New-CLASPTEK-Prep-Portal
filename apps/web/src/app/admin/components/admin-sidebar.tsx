'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  FileBarChart,
  BookOpen,
  Library,
  Database,
  ClipboardList,
  Dumbbell,
  Users,
  FolderKanban,
  Building2,
  Bell,
  ShieldCheck,
  Plug,
  UserCog,
  Lock,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useAdminWorkspace } from '../../../workspace/AdminWorkspaceContext';
import { LogoBadge } from '../../../shared/ui/logo/LogoBadge';
import { useGlobalLogout } from '../../../features/auth/hooks/useGlobalLogout';
import { LogoutConfirmModal } from '../../../components/auth/LogoutConfirmModal';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  isPlaceholder?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard',  label: 'Dashboard',  href: '/admin/dashboard',  icon: <LayoutDashboard size={17} /> },
      { id: 'analytics',  label: 'Analytics',  href: '/admin/analytics',  icon: <BarChart3 size={17} /> },
      { id: 'reports',    label: 'Reports',    href: '/admin/reports',    icon: <FileBarChart size={17} /> },
    ],
  },
  {
    title: 'Learning',
    items: [
      { id: 'programmes',       label: 'Programmes',      href: '/admin/programmes',            icon: <BookOpen size={17} /> },
      { id: 'curriculum',       label: 'Curriculum',      href: '/admin/curriculum',            icon: <Library size={17} /> },
      { id: 'question-bank',    label: 'Question Bank',   href: '/admin/question-bank',         icon: <Database size={17} /> },
      { id: 'assessments',      label: 'Assessments',     href: '/admin/assessments',           icon: <ClipboardList size={17} /> },
      { id: 'practice-sessions',label: 'Practice Sessions', href: '/admin/practice-sessions',  icon: <Dumbbell size={17} /> },
    ],
  },
  {
    title: 'People',
    items: [
      { id: 'students',       label: 'Students',      href: '/admin/students',       icon: <Users size={17} /> },
      { id: 'groups',         label: 'Groups',        href: '/admin/groups',         icon: <FolderKanban size={17} /> },
      { id: 'organizations',  label: 'Organizations', href: '/admin/organizations',  icon: <Building2 size={17} /> },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'notifications', label: 'Notifications', href: '/admin/notifications', icon: <Bell size={17} /> },
      { id: 'audit',         label: 'Audit Logs',    href: '/admin/audit',         icon: <ShieldCheck size={17} /> },
      { id: 'integrations',  label: 'Integrations',  href: '/admin/integrations',  icon: <Plug size={17} /> },
      { id: 'users',         label: 'Users',         href: '/admin/users',         icon: <UserCog size={17} /> },
      { id: 'roles',         label: 'Roles',         href: '/admin/roles',         icon: <Lock size={17} /> },
      { id: 'settings',      label: 'Settings',      href: '/admin/settings',      icon: <Settings size={17} /> },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { pendingApprovals: _pendingApprovals } = useAdminWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapseRef = useRef<HTMLButtonElement>(null);

  const { handleLogout, isConfirmOpen, cancelLogout, confirmLogout, isLoggingOut } =
    useGlobalLogout();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Escape key closes mobile drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === href;
    return pathname?.startsWith(href.split('?')[0]) ?? false;
  };

  const SidebarContent = () => (
    <>
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0 0.5rem' : '0 0.875rem 0 1rem',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <LogoBadge size="sm" href="/admin/dashboard" ariaLabel="Go to Admin Dashboard" />
        )}
        <button
          ref={collapseRef}
          onClick={() => setCollapsed((p) => !p)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav Groups */}
      <nav
        style={{
          flex: 1,
          padding: '0.75rem 0.5rem',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
        aria-label="Admin Navigation"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* Group label — hidden when collapsed */}
            {!collapsed && (
              <div className="nav-label" style={{ paddingLeft: '0.875rem' }}>
                {group.title}
              </div>
            )}

            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className="nav-link"
                  style={{
                    color: active ? 'var(--brand-light)' : undefined,
                    backgroundColor: active ? 'var(--brand-subtle)' : undefined,
                    fontWeight: active ? 600 : undefined,
                    justifyContent: collapsed ? 'center' : undefined,
                    paddingLeft: collapsed ? '0' : undefined,
                    paddingRight: collapsed ? '0' : undefined,
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  {/* Active bar */}
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

                  <span
                    style={{
                      color: active ? 'var(--brand-light)' : 'var(--text-muted)',
                      display: 'flex',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </span>
                  )}

                  {!collapsed && item.badge && item.badge > 0 && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.1rem 0.4rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--brand-subtle)',
                        color: 'var(--brand-light)',
                        border: '1px solid var(--brand-border)',
                        flexShrink: 0,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
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
          title={collapsed ? 'Sign Out' : undefined}
          className="nav-link"
          style={{
            color: 'var(--error)',
            width: '100%',
            justifyContent: collapsed ? 'center' : undefined,
          }}
          aria-label="Sign Out of Admin Console"
        >
          <LogOut size={17} style={{ flexShrink: 0, color: 'var(--error)' }} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile trigger bar ── */}
      <div
        className="mobile-sidebar-bar md:hidden"
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--header-height)',
          padding: '0 1rem',
          backgroundColor: 'var(--surface-0)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-header)' as React.CSSProperties['zIndex'],
        }}
      >
        <LogoBadge size="sm" href="/admin/dashboard" />
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
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
          }}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex"
        style={{
          flexDirection: 'column',
          width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
          height: '100vh',
          backgroundColor: 'var(--surface-0)',
          borderRight: '1px solid var(--border)',
          transition: 'width var(--duration-normal) var(--ease-in-out)',
          zIndex: 'var(--z-sidebar)' as React.CSSProperties['zIndex'],
          flexShrink: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-modal)' as React.CSSProperties['zIndex'],
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(2, 6, 23, 0.75)',
              backdropFilter: 'blur(4px)',
            }}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin Navigation"
            style={{
              position: 'relative',
              width: '280px',
              height: '100%',
              backgroundColor: 'var(--surface-0)',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-floating)',
              overflow: 'hidden',
            }}
          >
            {/* Close button overlay */}
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                zIndex: 2,
              }}
            >
              <X size={14} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      <LogoutConfirmModal
        isOpen={isConfirmOpen}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};
