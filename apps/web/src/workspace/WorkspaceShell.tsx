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
  LogOut,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { WorkspaceContext } from './WorkspaceContext';
import { WorkspaceId, workspaceRegistry } from './workspace-registry';
import { RouteGuard } from '../components/auth/route-guard';
import { TopNavigation } from '../shared/ui/navigation/TopNavigation';
import { SidebarItem } from '../shared/ui/navigation/SidebarItem';
import { Breadcrumb, BreadcrumbItem } from '../shared/ui/breadcrumb/Breadcrumb';
import { useAuthContext } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { useGlobalLogout } from '../features/auth/hooks/useGlobalLogout';

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
    case 'Bell':
      return <Bell size={size} />;
    default:
      return <LayoutDashboard size={size} />;
  }
}

export function WorkspaceShell({ workspaceRole, children }: WorkspaceShellProps) {
  const context = useContext(WorkspaceContext);
  const { user: authUser, isLoading: authLoading } = useAuthContext();
  const { handleLogout } = useGlobalLogout();
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

  const { resolvedTheme, toggleTheme } = useTheme();
  const collapsed = preferences.sidebarCollapsed;

  const handleSwitch = (id: WorkspaceId) => {
    setWorkspaceId(id);
    setSwitcherOpen(false);
    const target = workspaceRegistry[id];
    router.push(target.defaultRoute);
  };

  const checkIsItemActive = (itemHref: string, currentPath: string | null): boolean => {
    if (!currentPath) return false;
    if (currentPath === itemHref) return true;
    if (itemHref !== '/' && currentPath.startsWith(itemHref + '/')) return true;

    // Route alias & nested path mappings for student workspace:
    if (
      itemHref === '/dashboard' &&
      (currentPath === '/student' || currentPath === '/student/welcome')
    )
      return true;
    if (
      itemHref === '/student/practice' &&
      (currentPath === '/practice' ||
        currentPath.startsWith('/practice/') ||
        currentPath.startsWith('/student/practice'))
    )
      return true;
    if (
      itemHref === '/student/assessments' &&
      (currentPath === '/student/diagnostics' ||
        currentPath.startsWith('/student/diagnostics/') ||
        currentPath.startsWith('/student/assessments/') ||
        currentPath.startsWith('/assessments'))
    )
      return true;
    if (
      itemHref === '/student/mock' &&
      (currentPath === '/student/mock-exams' ||
        currentPath.startsWith('/student/mock-exams/') ||
        currentPath.startsWith('/mock'))
    )
      return true;
    if (
      itemHref === '/learning-assistant' &&
      (currentPath === '/student/learning-assistant' ||
        currentPath.startsWith('/student/learning-assistant/') ||
        currentPath === '/learning')
    )
      return true;
    if (
      itemHref === '/readiness' &&
      (currentPath === '/student/readiness' || currentPath.startsWith('/student/readiness/'))
    )
      return true;
    if (
      itemHref === '/student/results' &&
      (currentPath === '/student/result' ||
        currentPath.startsWith('/student/results/') ||
        currentPath.startsWith('/results'))
    )
      return true;
    if (
      itemHref === '/profile' &&
      (currentPath === '/student/settings' ||
        currentPath.startsWith('/profile/') ||
        currentPath.startsWith('/student/profile'))
    )
      return true;

    return false;
  };

  // Shared sidebar nav content used in both desktop sidebar and mobile drawer
  const SidebarNavContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <>
      {/* Workspace Switcher in Sidebar (desktop or mobile) */}
      {!collapsed && (
        <div style={{ padding: '0.75rem 1.0rem', position: 'relative' }}>
          <button
            onClick={() => setSwitcherOpen((p) => !p)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
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
                backgroundColor: 'var(--surface-0)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-floating)',
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
                      color: currentWorkspace.id === id ? 'var(--brand)' : 'var(--text-secondary)',
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
          const isActive = checkIsItemActive(item.href, pathname);
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

      <div
        style={{
          padding: '0.5rem',
          borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
        }}
      >
        <SidebarItem
          icon={<LogOut size={18} />}
          label="Sign Out"
          href="#"
          isActive={false}
          isCollapsed={!isMobile && collapsed}
          onClick={() => {
            handleLogout();
            if (onNavClick) onNavClick();
          }}
        />
      </div>
    </>
  );

  const isExamPlayerPage =
    pathname?.includes('/assessments/player') ||
    pathname?.includes('/mock/player') ||
    pathname?.includes('/practice/session');
  if (isExamPlayerPage) {
    return (
      <RouteGuard
        allowedRoles={workspaceRole === 'STUDENT' ? ['STUDENT'] : ['ADMINISTRATOR', 'SYSTEM_ADMIN']}
      >
        <div
          data-theme="dark"
          style={{
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#050310',
            color: '#ffffff',
            overflowX: 'hidden',
          }}
        >
          {children}
        </div>
      </RouteGuard>
    );
  }

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
          backgroundColor: 'var(--surface-canvas)',
          color: 'var(--text-primary)',
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
              backgroundColor: 'var(--surface-0)',
              borderBottom: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open Navigation Drawer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--surface-1)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <Menu size={20} />
            </button>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 800,
                color: currentWorkspace.themeAccent || 'var(--brand)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {currentWorkspace.name}
            </span>
            <button
              onClick={() => toggleTheme()}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--surface-1)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
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
            onToggleTheme={toggleTheme}
          />
        )}

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Desktop Sidebar — hidden on mobile */}
          {!isMobile && (
            <aside
              style={{
                width: collapsed ? '72px' : '260px',
                backgroundColor: 'var(--surface-0)',
                borderRight: '1px solid var(--border)',
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
                  borderBottom: '1px solid var(--border)',
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
                      color: currentWorkspace.themeAccent || 'var(--brand)',
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
                    color: 'var(--text-secondary)',
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
                backgroundColor: 'var(--surface-0)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
                overflowY: 'auto',
                boxShadow: 'var(--shadow-floating)',
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    color: currentWorkspace.themeAccent || 'var(--brand)',
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
                    backgroundColor: 'var(--surface-1)',
                    color: 'var(--text-secondary)',
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
              backdropFilter: 'blur(4px)',
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
                backgroundColor: 'var(--surface-0)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-floating)',
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
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
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
