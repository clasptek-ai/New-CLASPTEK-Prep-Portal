'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, LogOut, ChevronRight } from 'lucide-react';
import { LogoBadge } from '../logo/LogoBadge';

export interface NavLinkItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  title?: string;
  links: NavLinkItem[];
  userProfileName?: string;
  userRole?: string;
  logoHref?: string;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  onLogout,
  title = 'Navigation Menu',
  links,
  userProfileName = 'Candidate',
  userRole = 'Student',
  logoHref = '/student/welcome',
}: MobileNavDrawerProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 h-full flex flex-col justify-between shadow-2xl animate-slideRight overflow-hidden"
      >
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
            <LogoBadge size="sm" href={logoHref} />
            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
              aria-label="Close navigation drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Badge Info */}
          <div className="p-4 mx-4 my-4 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-bold text-sky-400 text-sm">
              {userProfileName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{userProfileName}</div>
              <div className="text-[10px] text-sky-400 font-semibold uppercase">{userRole}</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav
            className="px-3 space-y-1 overflow-y-auto max-h-[60vh]"
            aria-label="Mobile Drawer Navigation"
          >
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between min-h-11 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                >
                  <div className="flex items-center space-x-3">
                    {Icon && <Icon size={18} className="text-slate-400" />}
                    <span>{link.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {link.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-400 rounded-md">
                        {link.badge}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-slate-600" />
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            className="w-full flex items-center space-x-3 min-h-11 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
            aria-label="Sign Out of Clasptek Portal"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Backdrop Click Dismiss */}
      <div className="flex-1" onClick={onClose} aria-hidden="true" />
    </div>
  );
}
