'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Database,
  FileText,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { MobileNavDrawer } from '@/shared/ui/navigation/MobileNavDrawer';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const adminLinks = [
    { label: 'Admin Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Assessment Management', href: '/admin/assessments', icon: FileText },
    { label: 'Question Bank', href: '/admin/question-bank', icon: Database },
    { label: 'Students Directory', href: '/admin/students', icon: Users },
    { label: 'Analytics Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Telemetry', href: '/admin/audit', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Open admin mobile menu"
          >
            <Menu size={20} />
          </button>
          <LogoBadge size="sm" />
        </div>
        <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          ADMIN CONSOLE
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop & Tablet Sidebar */}
        <aside
          className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label={sidebarCollapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Admin Navigation Console">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== '/admin/dashboard' && pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={sidebarCollapsed ? link.label : undefined}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={18} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                  {!sidebarCollapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Administrative Scroll Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Mobile Drawer */}
      <MobileNavDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Admin Console Navigation"
        links={adminLinks}
        userRole="System Administrator"
      />
    </div>
  );
}
