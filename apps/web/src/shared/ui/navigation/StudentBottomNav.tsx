'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Dumbbell, BarChart2, User } from 'lucide-react';

const BOTTOM_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Assessments', href: '/student/assessments', icon: BookOpen },
  { label: 'Practice',   href: '/student/practice',    icon: Dumbbell },
  { label: 'Results',    href: '/student/results',      icon: BarChart2 },
  { label: 'Profile',    href: '/profile',              icon: User },
];

export function StudentBottomNav() {
  const pathname = usePathname();

  // Hide during active exam/player sessions to avoid distraction
  if (pathname?.includes('/player') || pathname?.includes('/exam/')) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/student';
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-sticky)' as React.CSSProperties['zIndex'],
        height: 'var(--bottom-nav-height)',
        backgroundColor: 'var(--surface-0)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 0.25rem',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      aria-label="Student Mobile Navigation"
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              minWidth: '52px',
              minHeight: '44px',
              padding: '6px 8px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: active ? 'var(--brand-light)' : 'var(--text-muted)',
              backgroundColor: active ? 'var(--brand-subtle)' : 'transparent',
              transition: 'all var(--transition-fast)',
              fontWeight: active ? 600 : 400,
            }}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={19} />
            <span style={{ fontSize: '0.625rem', letterSpacing: '0.01em', lineHeight: 1 }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
