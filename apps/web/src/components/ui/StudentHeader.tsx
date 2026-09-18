'use client';

import React from 'react';
import Link from 'next/link';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useGlobalLogout } from '@/features/auth/hooks/useGlobalLogout';

export interface StudentHeaderProps {
  activeTab?: string;
  activeProgrammeName?: string;
  onSelectProgramme?: (prog: string) => void;
}

export function StudentHeader({
  activeTab = 'dashboard',
  activeProgrammeName = 'IELTS Academic',
}: StudentHeaderProps) {
  const { user } = useAuthContext();
  const { handleLogout, isLoggingOut } = useGlobalLogout();

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'assessments', label: 'Pre-Assessment', href: '/student/assessments' },
    { id: 'mock', label: 'Mock Exams', href: '/student/mock' },
    { id: 'results', label: 'Results & Analytics', href: '/student/results' },
    { id: 'learning', label: 'Learning Programs', href: '/learning' },
    { id: 'profile', label: 'Profile', href: '/profile' },
  ];

  const studentName = user?.email?.split('@')[0] || 'Student';

  return (
    <header className="sticky top-0 w-full z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* ── Top Row: Brand, Exam Indicator, Status, User Menu ── */}
      <div className="h-16 max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <LogoBadge size="sm" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#131b2e] tracking-tight leading-none">
                Clasptek Portal
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#545f73] mt-0.5">
                Learn | Lead | Impact
              </span>
            </div>
          </Link>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden md:block" />

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2f3ff] text-[#003c90] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#0f52ba] animate-pulse" />
            <span>{activeProgrammeName} Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* User badge */}
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-8 h-8 rounded-full bg-[#f2f3ff] border border-[#d9e2ff] flex items-center justify-center text-[#003c90] font-bold text-xs uppercase">
              {studentName.slice(0, 2)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#131b2e] capitalize">{studentName}</span>
              <span className="text-[10px] text-slate-500 font-mono">Candidate ID: Verified</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => handleLogout()}
            disabled={isLoggingOut}
            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* ── Bottom Row: Clean Horizontal Navigation Tabs ── */}
      <div className="h-11 max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center gap-6 overflow-x-auto no-scrollbar border-t border-slate-100">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`h-full inline-flex items-center text-xs font-semibold tracking-wide whitespace-nowrap transition-colors no-underline border-b-2 ${
                isActive
                  ? 'text-[#003c90] border-[#003c90]'
                  : 'text-[#545f73] hover:text-[#131b2e] border-transparent'
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
