'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileSpreadsheet,
  Award,
  HelpCircle,
  Database,
  Upload,
  Users,
  GraduationCap,
  UserCheck,
  Bell,
  BarChart3,
  Settings,
  ShieldCheck,
  LifeBuoy,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useAdminWorkspace } from '../../../workspace/AdminWorkspaceContext';
import { LogoBadge } from '../../../shared/ui/logo/LogoBadge';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: string;
  isPlaceholder?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { pendingApprovals } = useAdminWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navGroups: NavGroup[] = [
    {
      title: 'ADMINISTRATION',
      items: [
        {
          id: 'dashboard',
          label: 'Operations Dashboard',
          href: '/admin/dashboard',
          icon: <LayoutDashboard size={18} />,
        },
      ],
    },
    {
      title: 'ACADEMIC OPERATIONS',
      items: [
        {
          id: 'programmes',
          label: 'Programmes',
          href: '/admin/programmes',
          icon: <BookOpen size={18} />,
        },
        {
          id: 'curriculum',
          label: 'Curriculum & Courses',
          href: '/admin/curriculum',
          icon: <Layers size={18} />,
        },
        {
          id: 'resources',
          label: 'Resource Library',
          href: '/admin/resources',
          icon: <FileSpreadsheet size={18} />,
        },
      ],
    },
    {
      title: 'ASSESSMENT OPERATIONS',
      items: [
        {
          id: 'diagnostic-assessments',
          label: 'Diagnostic Assessments',
          href: '/admin/assessments?mode=assessment',
          icon: <Award size={18} />,
        },
        {
          id: 'mock-tests',
          label: 'Mock Examinations',
          href: '/admin/assessments?mode=mock',
          icon: <Award size={18} />,
        },
        {
          id: 'results',
          label: 'Results & Analytics',
          href: '/admin/results',
          icon: <BarChart3 size={18} />,
        },
      ],
    },
    {
      title: 'QUESTION BANK',
      items: [
        {
          id: 'questions',
          label: 'Question Management',
          href: '/admin/question-bank',
          icon: <Database size={18} />,
          badge: 12,
          badgeColor: '#fbbf24',
        },
        {
          id: 'import-centre',
          label: 'Import Centre (CSV/XLS/ZIP)',
          href: '/admin/question-bank/import',
          icon: <Upload size={18} />,
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          id: 'students',
          label: 'Student Directory',
          href: '/admin/students',
          icon: <Users size={18} />,
        },
        {
          id: 'announcements',
          label: 'Announcements',
          href: '/admin/notifications',
          icon: <Bell size={18} />,
        },
      ],
    },
    {
      title: 'PLATFORM',
      items: [
        {
          id: 'settings',
          label: 'Platform Settings',
          href: '/admin/settings',
          icon: <Settings size={18} />,
        },
        {
          id: 'audit',
          label: 'Audit & Event Logs',
          href: '/admin/audit',
          icon: <ShieldCheck size={18} />,
        },
        {
          id: 'support',
          label: 'Support Tickets',
          href: '/admin/help',
          icon: <LifeBuoy size={18} />,
          badge: 3,
          badgeColor: '#38bdf8',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Drawer Trigger Bar */}
      <div
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: '#111827',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        className="mobile-sidebar-bar"
      >
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
          Clasptek Admin Console
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Main Persistent Sidebar Container */}
      <aside
        style={{
          width: collapsed ? '72px' : '260px',
          backgroundColor: 'var(--bg-surface-0, #111827)',
          borderRight: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 50,
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Sidebar Header Brand */}
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0' : '0 1.25rem',
            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))',
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <LogoBadge size="sm" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Sidebar Collapse"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
              borderRadius: '6px',
            }}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Navigation Group Items */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {navGroups.map((group, groupIdx) => (
            <div
              key={groupIdx}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
            >
              {!collapsed && (
                <div
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: 'var(--text-muted, #64748b)',
                    letterSpacing: '0.08em',
                    padding: '0.4rem 0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {group.title}
                </div>
              )}

              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin/dashboard' &&
                    pathname.startsWith(item.href.split('?')[0]));

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'space-between',
                      padding: collapsed ? '0.65rem 0' : '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-md, 8px)',
                      textDecoration: 'none',
                      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                      color: isActive
                        ? 'var(--primary-400, #3b82f6)'
                        : 'var(--text-secondary, #cbd5e1)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.85rem',
                      position: 'relative',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {/* Active Accent Bar */}
                    {isActive && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '15%',
                          bottom: '15%',
                          width: '3px',
                          borderRadius: '0 4px 4px 0',
                          backgroundColor: 'var(--primary-400, #3b82f6)',
                        }}
                      />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          color: isActive
                            ? 'var(--primary-400, #3b82f6)'
                            : 'var(--text-muted, #94a3b8)',
                          display: 'flex',
                        }}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && item.badge > 0 && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          color: 'var(--primary-400, #3b82f6)',
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
        </div>
      </aside>
    </>
  );
};
