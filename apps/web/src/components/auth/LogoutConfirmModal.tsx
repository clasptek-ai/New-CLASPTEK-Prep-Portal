'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';

export interface LogoutConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export function LogoutConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
  isLoggingOut = false,
}: LogoutConfirmModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelBtnRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100 animate-scaleUp">
        {/* Header Icon */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 id="logout-dialog-title" className="text-lg font-bold text-white">
              Assessment In Progress
            </h3>
            <span className="text-xs text-amber-400 font-semibold">Active Session Warning</span>
          </div>
        </div>

        {/* Message Body */}
        <p id="logout-dialog-desc" className="text-sm text-slate-300 mb-6 leading-relaxed">
          Your assessment progress has been saved automatically. Are you sure you want to sign out?
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={isLoggingOut}
            className="min-h-11 min-w-25 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="min-h-11 min-w-30 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/20 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
          >
            <LogOut size={16} />
            <span>{isLoggingOut ? 'Signing Out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
