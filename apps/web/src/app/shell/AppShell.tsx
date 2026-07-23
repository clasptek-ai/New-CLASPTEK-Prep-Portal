'use client';

import React, { useEffect } from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="app-shell-root"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app, #0f172a)',
        color: 'var(--text-primary, #f8fafc)',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  );
}

export default AppShell;
