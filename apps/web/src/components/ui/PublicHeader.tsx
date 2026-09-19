'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Shield, ArrowRight, User } from 'lucide-react';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';

export interface PublicHeaderProps {
  activePath?: string;
}

export function PublicHeader({ activePath }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Examinations', href: '/examinations' },
    { label: 'Pre-Assessments', href: '/#pre-assessment' },
    { label: 'Mock Exams', href: '/#mock-exams' },
    { label: 'Platform Features', href: '/#features' },
  ];

  return (
    <header className="sticky top-0 w-full z-50 bg-white border-b border-slate-200 shadow-[0_1px_4px_rgba(5,3,16,0.04)]">
      {/* ── 1. Top Telemetry Ticker ── */}
      <div className="w-full bg-bg-light-blue py-1.5 px-4 sm:px-8 border-b border-[#B9DDF8]">
        <div className="max-w-360 mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-semibold text-deep-navy">
              <span className="h-2 w-2 rounded-full bg-[#045EAD] inline-block animate-pulse" />
              Cluster Telemetry: Active
            </span>
            <span className="hidden sm:inline text-slate-400">/</span>
            <span className="hidden sm:inline">ISO/IEC 23988 Diagnostic Protocol</span>
            <span className="hidden md:inline text-slate-400">/</span>
            <span className="hidden md:inline font-mono text-[11px] font-semibold text-deep-navy">LATENCY: 14ms UTC</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] font-semibold text-deep-navy">
              Standardized Scoring Matrix Active
            </span>
            <span className="inline-flex items-center gap-1 text-[#045EAD] font-bold text-[11px]">
              <Shield size={12} />
              Cryptographically Verified
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Primary Navigation Bar ── */}
      <div className="h-16 max-w-360 mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Brand & Nav links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <LogoBadge size="sm" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-deep-navy tracking-tight leading-none group-hover:text-[#045EAD] transition-colors">
                Clasptek Prep
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#475569] mt-0.5">
                Standardized Prep Portal
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 h-16 pt-0.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = activePath === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`h-full inline-flex items-center text-sm font-semibold transition-colors no-underline border-b-2 ${
                    isActive
                      ? 'text-[#045EAD] font-bold border-[#045EAD]'
                      : 'text-slate-700 hover:text-deep-navy border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action CTAs (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-300 text-deep-navy text-xs font-bold hover:bg-bg-neutral hover:border-slate-400 transition-colors no-underline"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#045EAD] hover:bg-brand-hover text-white text-xs font-bold shadow-sm transition-all no-underline"
          >
            <span>Take a Pre-Assessment</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center p-2 rounded-lg text-deep-navy hover:bg-slate-100"
            aria-label="Sign In"
          >
            <User size={20} />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-deep-navy hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#045EAD]"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── 3. Mobile Slide-down Drawer ── */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-deep-navy hover:bg-bg-light-blue transition-colors no-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-deep-navy hover:bg-bg-neutral no-underline"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#045EAD] hover:bg-brand-hover text-white text-sm font-bold shadow-sm no-underline"
            >
              <span>Take a Pre-Assessment</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
