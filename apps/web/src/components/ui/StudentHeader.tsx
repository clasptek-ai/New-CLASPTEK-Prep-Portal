'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  Zap,
  BookOpen,
  FileBarChart,
  User,
} from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useGlobalLogout } from '@/features/auth/hooks/useGlobalLogout';

export interface StudentHeaderProps {
  activeTab?: string;
  activeProgrammeName?: string;
  onSelectProgramme?: (prog: string) => void;
}

export function StudentHeader({
  activeTab,
  activeProgrammeName = 'IELTS Academic',
}: StudentHeaderProps) {
  const { user } = useAuthContext();
  const { handleLogout, isLoggingOut } = useGlobalLogout();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer upon route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // The 6 Canonical Student Information Architecture Pillars
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { id: 'assessments', label: 'Pre-Assessment', href: '/student/assessments', icon: FileText },
    { id: 'practice', label: 'Practice', href: '/practice', icon: Zap },
    { id: 'mock', label: 'Mock Exams', href: '/student/mock', icon: BookOpen },
    { id: 'results', label: 'Results & Analytics', href: '/student/results', icon: FileBarChart },
    { id: 'profile', label: 'Profile', href: '/profile', icon: User },
  ];

  const studentName = user?.email?.split('@')[0] || 'Student';

  // Strict route matcher to avoid false positives from simple substring matching
  const isTabActive = (tabId: string, tabHref: string) => {
    if (activeTab) {
      return activeTab === tabId;
    }
    if (!pathname) return false;

    switch (tabId) {
      case 'dashboard':
        return pathname === '/dashboard';
      case 'assessments':
        return (
          pathname === '/student/assessments' ||
          pathname.startsWith('/student/assessments/') ||
          pathname.startsWith('/student/welcome')
        );
      case 'practice':
        return (
          pathname === '/practice' ||
          pathname.startsWith('/practice/') ||
          pathname.startsWith('/student/practice')
        );
      case 'mock':
        return pathname === '/student/mock' || pathname.startsWith('/student/mock/');
      case 'results':
        return pathname === '/student/results' || pathname.startsWith('/student/results/');
      case 'profile':
        return pathname === '/profile' || pathname.startsWith('/profile/');
      default:
        return pathname === tabHref;
    }
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* ── Top Row: Brand, Exam Indicator, Status, User Menu ── */}
      <div className="h-16 max-w-360 mx-auto px-4 sm:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-1.5 rounded-lg text-slate-700 hover:bg-slate-100 md:hidden flex items-center justify-center transition-colors"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <LogoBadge size="sm" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-deep-navy tracking-tight leading-none">
                Clasptek Portal
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#475569] mt-0.5">
                Learn | Lead | Impact
              </span>
            </div>
          </Link>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden md:block" />

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#045EAD] animate-pulse" />
            <span>{activeProgrammeName} Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* User badge */}
          <div className="flex items-center gap-2 sm:gap-2.5 pl-1 sm:pl-2">
            <div className="w-8 h-8 rounded-full bg-bg-light-blue border border-[#B9DDF8] flex items-center justify-center text-[#045EAD] font-bold text-xs uppercase shrink-0">
              {studentName.slice(0, 2)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-deep-navy capitalize truncate max-w-32">
                {studentName}
              </span>
              <span className="text-[10px] text-[#475569] font-mono font-medium">
                Verified Candidate
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => handleLogout()}
            disabled={isLoggingOut}
            className="p-2 rounded-lg text-[#475569] hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer (Visible when toggled on small screens) ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD] text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-[#045EAD] animate-pulse shrink-0" />
            <span className="truncate">{activeProgrammeName} Active</span>
          </div>
          <nav className="space-y-1">
            {navTabs.map((tab) => {
              const isActive = isTabActive(tab.id, tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors no-underline ${
                    isActive
                      ? 'bg-bg-light-blue text-[#045EAD] border border-[#B9DDF8]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-deep-navy'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-[#045EAD]' : 'text-[#475569]'} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* ── Bottom Row: Clean Horizontal Navigation Tabs (Full 6 Pillars) ── */}
      <div className="h-11 max-w-360 mx-auto px-4 sm:px-8 flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar border-t border-slate-100">
        {navTabs.map((tab) => {
          const isActive = isTabActive(tab.id, tab.href);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`h-full inline-flex items-center text-xs font-bold tracking-wide whitespace-nowrap transition-colors no-underline border-b-2 px-1 sm:px-0 ${
                isActive
                  ? 'text-[#045EAD] border-[#045EAD]'
                  : 'text-slate-700 hover:text-deep-navy border-transparent'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
