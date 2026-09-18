'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ShieldCheck, LogOut, ChevronDown, X, ArrowRight } from 'lucide-react';
import { useAdminWorkspace } from '../../../workspace/AdminWorkspaceContext';
import { Avatar } from '../../../shared/ui/avatar/Avatar';
import { Badge } from '../../../shared/ui/badge/Badge';
import { useGlobalLogout } from '../../../features/auth/hooks/useGlobalLogout';
import { LogoutConfirmModal } from '../../../components/auth/LogoutConfirmModal';

/* ─────────────────────────────────────────
   NAVIGATION SEARCH — Command Palette data
───────────────────────────────────────────*/
interface SearchResult {
  id: string;
  label: string;
  description: string;
  href: string;
  category: string;
}

const SEARCH_DESTINATIONS: SearchResult[] = [
  // Overview
  { id: 'dashboard',   label: 'Dashboard',        description: 'Admin overview & key metrics',  href: '/admin/dashboard',    category: 'Overview' },
  { id: 'analytics',   label: 'Analytics',        description: 'Cohort and performance analytics', href: '/admin/analytics', category: 'Overview' },
  { id: 'reports',     label: 'Reports',           description: 'Operational and progress reports', href: '/admin/reports',   category: 'Overview' },
  // Learning
  { id: 'programmes',  label: 'Programmes',        description: 'Manage exam programmes',        href: '/admin/programmes',   category: 'Learning' },
  { id: 'curriculum',  label: 'Curriculum',        description: 'Course and module management',  href: '/admin/curriculum',   category: 'Learning' },
  { id: 'qbank',       label: 'Question Bank',     description: 'Questions, types and marking',  href: '/admin/question-bank', category: 'Learning' },
  { id: 'assessments', label: 'Assessments',       description: 'Diagnostics and mock exams',    href: '/admin/assessments',  category: 'Learning' },
  { id: 'practice',    label: 'Practice Sessions', description: 'Student practice activity',     href: '/admin/practice-sessions', category: 'Learning' },
  // People
  { id: 'students',    label: 'Students',          description: 'Student directory and profiles', href: '/admin/students',    category: 'People' },
  { id: 'groups',      label: 'Groups',            description: 'Student cohort groups',         href: '/admin/groups',      category: 'People' },
  { id: 'orgs',        label: 'Organizations',     description: 'Organization management',       href: '/admin/organizations', category: 'People' },
  // System
  { id: 'notifs',      label: 'Notifications',     description: 'System notification settings',  href: '/admin/notifications', category: 'System' },
  { id: 'audit',       label: 'Audit Logs',        description: 'Activity and security audit',   href: '/admin/audit',        category: 'System' },
  { id: 'integrations',label: 'Integrations',      description: 'Third-party integrations',      href: '/admin/integrations', category: 'System' },
  { id: 'users',       label: 'Users',             description: 'Admin user accounts',           href: '/admin/users',        category: 'System' },
  { id: 'roles',       label: 'Roles & Permissions', description: 'Access control management',  href: '/admin/roles',        category: 'System' },
  { id: 'settings',    label: 'Settings',          description: 'Platform configuration',        href: '/admin/settings',     category: 'System' },
];

function useSearch(query: string): SearchResult[] {
  if (!query.trim()) {
    return [
      SEARCH_DESTINATIONS[0],  // Dashboard
      SEARCH_DESTINATIONS[3],  // Programmes
      SEARCH_DESTINATIONS[5],  // Question Bank
      SEARCH_DESTINATIONS[6],  // Assessments
      SEARCH_DESTINATIONS[8],  // Students
      SEARCH_DESTINATIONS[14], // Settings
    ].filter(Boolean);
  }
  const q = query.toLowerCase().trim();
  return SEARCH_DESTINATIONS.filter(
    (d) =>
      d.label.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
  ).slice(0, 8);
}

/* ─────────────────────────────────────────
   SEARCH MODAL
───────────────────────────────────────────*/
function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const results = useSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[activeIdx]) {
        router.push(results[activeIdx].href);
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [results, activeIdx, onClose, router]
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Admin Navigation Command Search"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '10vh',
        zIndex: 'var(--z-modal)' as React.CSSProperties['zIndex'],
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          margin: '0 1rem',
          backgroundColor: 'var(--surface-0)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            borderBottom: `1px solid ${query && results.length ? 'var(--border)' : 'transparent'}`,
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search destinations — students, questions, settings…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
              }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <kbd
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.2rem 0.45rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {!query.trim() && (
            <div
              style={{
                padding: '0.5rem 1rem 0.25rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Suggested Destinations
            </div>
          )}

          {results.length === 0 ? (
            <div
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
              }}
            >
              No destinations matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul
              role="listbox"
              style={{ listStyle: 'none', margin: 0, padding: '0.5rem' }}
            >
              {results.map((result, idx) => (
                <li key={result.id} role="option" aria-selected={idx === activeIdx}>
                  <Link
                    href={result.href}
                    onClick={onClose}
                    onMouseEnter={() => setActiveIdx(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      padding: '0.65rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      backgroundColor: idx === activeIdx ? 'var(--brand-subtle)' : 'transparent',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: idx === activeIdx ? 'var(--brand-light)' : 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {result.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          marginTop: '1px',
                        }}
                      >
                        {result.description}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {result.category}
                      </span>
                      <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div
          style={{
            display: 'flex',
            gap: '1.25rem',
            padding: '0.625rem 1rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
          }}
        >
          <span><kbd style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--surface-1)' }}>↑↓</kbd> Navigate</span>
          <span><kbd style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--surface-1)' }}>↵</kbd> Open</span>
          <span><kbd style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--surface-1)' }}>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ADMIN HEADER
───────────────────────────────────────────*/
export const AdminHeader: React.FC = () => {
  const { adminProfile, systemHealth, academicTerm, unreadNotificationsCount } =
    useAdminWorkspace();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { handleLogout, isConfirmOpen, cancelLogout, confirmLogout, isLoggingOut } =
    useGlobalLogout();

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((p) => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header
        style={{
          height: 'var(--header-height)',
          width: '100%',
          backgroundColor: 'var(--surface-0)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          boxSizing: 'border-box',
          flexShrink: 0,
          gap: '1rem',
        }}
      >
        {/* ── Search trigger ── */}
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search admin console (⌘K)"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '0.4rem 0.75rem',
            width: 'min(320px, 100%)',
            cursor: 'pointer',
            transition: 'border-color var(--transition-fast)',
            minHeight: '36px',
          }}
          onMouseEnter={(e) => { (e.currentTarget).style.borderColor = 'var(--brand-border)'; }}
          onMouseLeave={(e) => { (e.currentTarget).style.borderColor = 'var(--border-strong)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Search admin…
            </span>
          </div>
          <kbd
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* ── Right controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          {/* System health */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
            className="hidden sm:flex"
          >
            <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
            <Badge variant={systemHealth === 'HEALTHY' ? 'success' : 'warning'}>
              {systemHealth}
            </Badge>
          </div>

          {/* Academic term */}
          {academicTerm && (
            <span
              className="hidden lg:block"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.2rem 0.6rem',
              }}
            >
              {academicTerm}
            </span>
          )}

          {/* Notification bell */}
          <button
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'var(--touch-target-min)',
              height: 'var(--touch-target-min)',
              borderRadius: 'var(--radius-md)',
              transition: 'background-color var(--transition-fast)',
            }}
            aria-label={`Notifications${unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount} unread)` : ''}`}
          >
            <Bell size={17} />
            {unreadNotificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--error)',
                  border: '2px solid var(--surface-0)',
                }}
              />
            )}
          </button>

          {/* Profile dropdown */}
          {adminProfile && (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((p) => !p)}
                aria-label="Admin profile menu"
                aria-expanded={profileDropdownOpen}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: 'var(--touch-target-min)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0 0.25rem',
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                <Avatar name={adminProfile.name} size="sm" />
                <div
                  className="hidden sm:flex"
                  style={{ flexDirection: 'column', textAlign: 'left' }}
                >
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {adminProfile.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--brand-light)',
                      fontWeight: 500,
                    }}
                  >
                    {adminProfile.role}
                  </span>
                </div>
                <ChevronDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </button>

              {/* Dropdown panel */}
              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '200px',
                    backgroundColor: 'var(--surface-0)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-floating)',
                    padding: '0.375rem',
                    zIndex: 'var(--z-dropdown)' as React.CSSProperties['zIndex'],
                  }}
                >
                  <div
                    style={{
                      padding: '0.5rem 0.75rem 0.625rem',
                      borderBottom: '1px solid var(--border)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {adminProfile.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      Signed in as Administrator
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      minHeight: 'var(--touch-target-min)',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--error)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--error-subtle)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    aria-label="Sign Out of Admin Console"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      <LogoutConfirmModal
        isOpen={isConfirmOpen}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};
