'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, ShieldCheck, User } from 'lucide-react';
import { useAdminWorkspace } from '../../../workspace/AdminWorkspaceContext';
import { Avatar } from '../../../shared/ui/avatar/Avatar';
import { Badge } from '../../../shared/ui/badge/Badge';

export const AdminHeader: React.FC = () => {
  const { adminProfile, systemHealth, academicTerm, unreadNotificationsCount } =
    useAdminWorkspace();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Global Cmd+K / Ctrl+K keyboard shortcut listener for Admin Console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        style={{
          height: '64px',
          width: '100%',
          backgroundColor: 'var(--bg-surface-0, #111827)',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          boxSizing: 'border-box',
          zIndex: 'var(--z-header, 40)',
        }}
      >
        {/* Global Admin Search Bar */}
        <div
          onClick={() => setSearchOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-1, #161e2e)',
            border: '1px solid var(--border-default, #1e293b)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '0.45rem 0.85rem',
            width: '340px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
            <Search size={15} color="var(--text-muted, #94a3b8)" />
            <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>
              Search students, courses, questions...
            </span>
          </div>
          <kbd
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-surface-2, #1e293b)',
              color: 'var(--text-muted, #94a3b8)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            ⌘K
          </kbd>
        </div>

        {/* System Status, Term Switcher & Profile Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* System Health Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary, #94a3b8)',
            }}
          >
            <ShieldCheck size={16} color="var(--success-500, #10b981)" />
            <span>System:</span>
            <Badge variant={systemHealth === 'HEALTHY' ? 'success' : 'warning'}>
              {systemHealth}
            </Badge>
          </div>

          {/* Academic Term Switcher */}
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-secondary, #cbd5e1)',
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--bg-surface-1, #161e2e)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {academicTerm}
          </span>

          {/* Notification Bell */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={18} color="var(--text-secondary, #94a3b8)" />
            {unreadNotificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-400, #3b82f6)',
                }}
              />
            )}
          </div>

          {/* Admin Profile Dropdown */}
          {adminProfile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                paddingLeft: '0.5rem',
                borderLeft: '1px solid var(--border-subtle)',
              }}
            >
              <Avatar name={adminProfile.name} size="sm" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary, #f8fafc)',
                    lineHeight: 1.2,
                  }}
                >
                  {adminProfile.name}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--primary-400, #3b82f6)',
                    fontWeight: 600,
                  }}
                >
                  {adminProfile.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Global Cmd+K Search Modal for Admin Workspace */}
      {searchOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: '10vh',
            zIndex: 'var(--z-modal, 100)',
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              backgroundColor: 'var(--bg-surface-0, #111827)',
              border: '1px solid var(--border-default, #1e293b)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.25rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Platform Administration registries (Press ESC to close)..."
              style={{
                width: '100%',
                padding: '0.75rem 1.0rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-default, #1e293b)',
                backgroundColor: 'var(--bg-surface-1, #161e2e)',
                color: 'var(--text-primary, #f8fafc)',
                fontSize: '0.9375rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div
              style={{
                marginTop: '0.75rem',
                fontSize: '0.8125rem',
                color: 'var(--text-muted, #94a3b8)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>
                Active Scope: <strong>Platform Administration Console</strong>
              </span>
              <span>
                Press <strong>ESC</strong> to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
