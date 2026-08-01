'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Award, User, Bell } from 'lucide-react';

export function StudentBottomNav() {
  const pathname = usePathname();

  // Distraction-Free Responsive Exam Mode: Hide bottom nav during active exam player sessions
  if (pathname?.includes('/player')) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/student', icon: Home },
    { label: 'Practice', href: '/student/assessments', icon: BookOpen },
    { label: 'Results', href: '/student/results', icon: Award },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Alerts', href: '/notifications', icon: Bell },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex justify-around items-center shadow-lg"
      aria-label="Student Mobile Bottom Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== '/student' && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center min-w-14 min-h-11 px-2 py-1 rounded-xl transition-all ${
              isActive
                ? 'text-sky-400 font-bold bg-sky-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={20} className={isActive ? 'text-sky-400' : 'text-slate-400'} />
            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
