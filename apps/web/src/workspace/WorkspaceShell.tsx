'use client';

import React, { useContext, useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Zap,
  FileText,
  BookOpen,
  Sparkles,
  Calendar,
  TrendingUp,
  User,
  Settings,
  Users,
  Layers,
  Shield,
  Library,
  LineChart,
  FileBarChart,
  Lock,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { WorkspaceContext } from './WorkspaceContext';
import { WorkspaceId, workspaceRegistry } from './workspace-registry';
import { RouteGuard } from '../components/auth/route-guard';
import { TopNavigation } from '../shared/ui/navigation/TopNavigation';
import { SidebarItem } from '../shared/ui/navigation/SidebarItem';
import { Breadcrumb, BreadcrumbItem } from '../shared/ui/breadcrumb/Breadcrumb';

interface WorkspaceShellProps {
  workspaceRole: WorkspaceId;
  children: React.ReactNode;
}

function getNavIcon(iconName: string) {
  const size = 18;
  switch (iconName) {
    case 'LayoutDashboard':
      return <LayoutDashboard size={size} />;
    case 'GraduationCap':
      return <GraduationCap size={size} />;
    case 'Zap':
      return <Zap size={size} />;
    case 'FileText':
      return <FileText size={size} />;
    case 'BookOpen':
      return <BookOpen size={size} />;
    case 'Sparkles':
      return <Sparkles size={size} />;
    case 'Calendar':
      return <Calendar size={size} />;
    case 'TrendingUp':
      return <TrendingUp size={size} />;
    case 'User':
    case 'UserSettings':
      return <User size={size} />;
    case 'Settings':
    case 'Sliders':
      return <Settings size={size} />;
    case 'Users':
      return <Users size={size} />;
    case 'Layers':
      return <Layers size={size} />;
    case 'Shield':
      return <Shield size={size} />;
    case 'Library':
      return <Library size={size} />;
    case 'LineChart':
      return <LineChart size={size} />;
    case 'FileBarChart':
      return <FileBarChart size={size} />;
    case 'Lock':
      return <Lock size={size} />;
    default:
      return <LayoutDashboard size={size} />;
  }
}

import { useAuthContext } from '../providers/AuthProvider';

export function WorkspaceShell({ workspaceRole, children }: WorkspaceShellProps) {
  const context = useContext(WorkspaceContext);
  const { user: authUser, isLoading: authLoading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  if (!context) {
    throw new Error('WorkspaceShell must be wrapped in WorkspaceProvider context');
  }

  const { currentWorkspace, setWorkspaceId, preferences, updatePreferences } = context;

  const displayName = authLoading
    ? 'Loading Profile...'
    : authUser?.name || authUser?.email?.split('@')[0] || currentWorkspace.name;

  const displayEmail = authLoading ? '' : authUser?.email || '';

  // Mobile detection based on viewport width
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (currentWorkspace.id !== workspaceRole) {
      setWorkspaceId(workspaceRole);
    }
  }, [workspaceRole, currentWorkspace.id, setWorkspaceId]);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeTheme = preferences.theme;
  const collapsed = preferences.sidebarCollapsed;

  const handleSwitch = (id: WorkspaceId) => {
    setWorkspaceId(id);
    setSwitcherOpen(false);
    const target = workspaceRegistry[id];
    router.push(target.defaultRoute);
  };

  // Shared sidebar nav content used in both desktop sidebar and mobile drawer
  const SidebarNavContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <>
      {!collapsed && (
        <div
          style={{
            padding: '0.75rem 1.0rem',
            borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
            position: 'relative',
          }}
        >
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            style={{
              width: '100%',
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--border-default, #1e293b)',
              backgroundColor: 'var(--bg-surface-1, #161e2e)',
              color: 'var(--text-primary, #f8fafc)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Workspace: {currentWorkspace.name}</span>
            <span>▾</span>
          </button>

          {switcherOpen && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                left: '16px',
                right: '16px',
                backgroundColor: 'var(--bg-surface-0, #111827)',
                border: '1px solid var(--border-default, #1e293b)',
                borderRadius: 'var(--radius-md, 8px)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 100,
                padding: '0.4rem',
              }}
            >
              {(Object.keys(workspaceRegistry) as WorkspaceId[])
                .filter((id) => {
                  if (id === 'ADMIN') {
                    return workspaceRole === 'ADMIN';
                  }
                  return true;
                })
                .map((id) => (
                  <button
                    key={id}
                    onClick={() => handleSwitch(id)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color:
                        currentWorkspace.id === id
                          ? 'var(--primary-500, #2563eb)'
                          : 'var(--text-secondary, #cbd5e1)',
                      textAlign: 'left',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {workspaceRegistry[id].name}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      <nav
        style={{
          flex: 1,
          padding: '0.75rem 0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto',
        }}
      >
        {currentWorkspace.navigation.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <SidebarItem
              key={idx}
              icon={getNavIcon(item.icon)}
              label={item.name}
              href={item.href}
              isActive={isActive}
              isCollapsed={!isMobile && collapsed}
              onClick={() => {
                router.push(item.href);
                if (onNavClick) onNavClick();
              }}
            />
          );
        })}
      </nav>
    </>
  );

  return (
    <RouteGuard
      allowedRoles={workspaceRole === 'STUDENT' ? ['STUDENT'] : ['ADMINISTRATOR', 'SYSTEM_ADMIN']}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-app, #0b0f19)',
          color: 'var(--text-primary, #f8fafc)',
        }}
      >
        {/* Mobile Header — only visible on small screens */}
        {isMobile && (
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-surface-0, #111827)',
              borderBottom: '1px solid var(--border-default, #1e293b)',
              flexShrink: 0,
              zIndex: 30,
            }}
          >
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--bg-surface-1, #161e2e)',
                color: 'var(--text-secondary, #cbd5e1)',
                cursor: 'pointer',
              }}
            >
              <Menu size={20} />
            </button>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 800,
                color: currentWorkspace.themeAccent || 'var(--primary-500, #2563eb)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {currentWorkspace.name}
            </span>
            <div style={{ width: 40 }} />
          </header>
        )}

        {/* Desktop Top Navigation — hidden on mobile since we have the mobile header above */}
        {!isMobile && (
          <TopNavigation
            user={{
              name: displayName,
              email: displayEmail,
              role: workspaceRole,
              avatarUrl: authUser?.user_metadata?.avatar_url,
            }}
            onSearch={(_q: string) => setSearchOpen(true)}
            onToggleTheme={() =>
              updatePreferences({ theme: activeTheme === 'dark' ? 'light' : 'dark' })
            }
          />
        )}

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Desktop Sidebar — hidden on mobile */}
          {!isMobile && (
            <aside
              style={{
                width: collapsed ? '72px' : '260px',
                backgroundColor: 'var(--bg-surface-0, #111827)',
                borderRight: '1px solid var(--border-default, #1e293b)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                overflowY: 'auto',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  padding: '0.875rem 1.0rem',
                  borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                }}
              >
                {!collapsed && (
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      color: currentWorkspace.themeAccent || 'var(--primary-500, #2563eb)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {currentWorkspace.name}
                  </span>
                )}
                <button
                  onClick={() => updatePreferences({ sidebarCollapsed: !collapsed })}
                  aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary, #cbd5e1)',
                    cursor: 'pointer',
                    padding: '0.35rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
              </div>

              <SidebarNavContent />
            </aside>
          )}

          {/* Main Content */}
          <main
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              overflowY: 'auto',
              padding: isMobile ? '1rem' : '1.5rem 2.0rem',
            }}
          >
            {!isMobile && (
              <div style={{ marginBottom: '1.0rem' }}>
                <Breadcrumb>
                  <BreadcrumbItem href="/">Portal</BreadcrumbItem>
                  <BreadcrumbItem href="#">{currentWorkspace.name}</BreadcrumbItem>
                  <BreadcrumbItem isCurrent>
                    {pathname
                      ? pathname
                          .replace('/instructor/', '')
                          .replace('/admin/', '')
                          .replace('/authoring/', '')
                          .toUpperCase()
                      : 'DASHBOARD'}
                  </BreadcrumbItem>
                </Breadcrumb>
              </div>
            )}

            <div style={{ flex: 1 }}>{children}</div>
          </main>
        </div>

        {/* Mobile Drawer Overlay */}
        {isMobile && mobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setMobileDrawerOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                zIndex: 40,
              }}
              aria-hidden="true"
            />
            {/* Drawer Panel */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '280px',
                backgroundColor: 'var(--bg-surface-0, #111827)',
                borderRight: '1px solid var(--border-default, #1e293b)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
                overflowY: 'auto',
                boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    color: currentWorkspace.themeAccent || 'var(--primary-500, #2563eb)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {currentWorkspace.name}
                </span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--bg-surface-1, #161e2e)',
                    color: 'var(--text-secondary, #cbd5e1)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <SidebarNavContent onNavClick={() => setMobileDrawerOpen(false)} />
            </div>
          </>
        )}

        {/* Global Command Search Overlay */}
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
              zIndex: 1000,
            }}
            onClick={() => setSearchOpen(false)}
          >
            <div
              style={{
                maxWidth: '600px',
                width: '90%',
                backgroundColor: 'var(--bg-surface-0, #111827)',
                border: '1px solid var(--border-default, #1e293b)',
                borderRadius: 'var(--radius-lg, 12px)',
                padding: '1.25rem',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                id="global-search-input"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${currentWorkspace.searchScope} registries (Press ESC to close)...`}
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
                  Active Scope: <strong>{currentWorkspace.name}</strong>
                </span>
                <span>
                  Press <strong>ESC</strong> to close
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}

export default WorkspaceShell;
