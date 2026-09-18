'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogoBadge } from '../../../shared/ui/logo/LogoBadge';
import { ArrowRight, Menu, X } from 'lucide-react';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-(--surface-0)/95 backdrop-blur-md border-b border-(--border) w-full h-16 flex items-center transition-colors">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-6 lg:gap-8 min-w-0">
          <Link
            href="/"
            className="no-underline shrink-0 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          >
            <div className="flex items-center gap-3 shrink-0">
              <LogoBadge size="sm" />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <a
              href="#hero"
              className="text-(--text-primary) hover:text-(--brand-light) transition-colors no-underline"
            >
              Home
            </a>
            <a
              href="#programmes"
              className="text-(--text-secondary) hover:text-(--brand-light) transition-colors no-underline"
            >
              Programmes
            </a>
            <a
              href="#why-choose-clasptek"
              className="text-(--text-secondary) hover:text-(--brand-light) transition-colors no-underline"
            >
              Why Choose Us
            </a>
          </nav>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Link
            href="/login"
            className="text-(--text-secondary) hover:text-(--text-primary) text-sm font-semibold no-underline transition-colors px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign In
          </Link>

          <Link href="/register" className="no-underline">
            <button
              type="button"
              className="bg-(--brand) hover:bg-(--brand-hover) text-white border-0 rounded-lg px-5 py-2 text-sm font-bold cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>Start Assessment</span>
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden shrink-0 w-11 h-11 min-w-11 min-h-11 flex items-center justify-center rounded-xl bg-(--surface-1) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-2) transition-colors border border-(--border) focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle Navigation Menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Slide-Out Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          role="navigation"
          aria-label="Mobile Navigation Drawer"
          className="md:hidden fixed inset-x-0 top-16 bg-(--surface-0)/98 backdrop-blur-2xl border-b border-(--border) shadow-2xl px-6 py-6 transition-all animate-in fade-in slide-in-from-top-2 overflow-y-auto max-h-[calc(100vh-4rem)] z-50"
        >
          <div className="flex flex-col gap-4">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-(--text-primary) hover:text-(--brand-light) no-underline py-2.5 border-b border-(--border) flex items-center justify-between"
            >
              <span>Home</span>
              <ArrowRight size={16} className="text-(--text-muted)" />
            </a>
            <a
              href="#programmes"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-(--text-secondary) hover:text-(--brand-light) no-underline py-2.5 border-b border-(--border) flex items-center justify-between"
            >
              <span>Programmes</span>
              <ArrowRight size={16} className="text-(--text-muted)" />
            </a>
            <a
              href="#why-choose-clasptek"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-(--text-secondary) hover:text-(--brand-light) no-underline py-2.5 border-b border-(--border) flex items-center justify-between"
            >
              <span>Why Choose Us</span>
              <ArrowRight size={16} className="text-(--text-muted)" />
            </a>

            <div className="flex flex-col gap-3 pt-3 mt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-(--text-primary) bg-(--surface-1) hover:bg-(--surface-2) py-3 rounded-xl font-semibold text-sm no-underline border border-(--border) transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-(--brand) hover:bg-(--brand-hover) text-white py-3 rounded-xl font-bold text-sm no-underline flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>Start Assessment</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
