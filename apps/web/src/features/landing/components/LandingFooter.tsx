'use client';

import React from 'react';
import Link from 'next/link';
import { LogoBadge } from '../../../shared/ui/logo/LogoBadge';

export function LandingFooter() {
  return (
    <footer className="border-t border-(--border) bg-(--surface-0) py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <LogoBadge size="sm" />

          <div className="flex items-center gap-6 text-sm text-(--text-secondary)">
            <Link href="/register" className="hover:text-(--text-primary) transition-colors no-underline">
              Register
            </Link>
            <Link href="/login" className="hover:text-(--text-primary) transition-colors no-underline">
              Sign In
            </Link>
            <Link href="/privacy" className="hover:text-(--text-primary) transition-colors no-underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-(--text-primary) transition-colors no-underline">
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="border-t border-(--border) pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-(--text-muted)">
          <span>© {new Date().getFullYear()} Clasptek Global. All rights reserved.</span>
          <span>Server-Authoritative Diagnostic & Examination Engine</span>
        </div>
      </div>
    </footer>
  );
}
