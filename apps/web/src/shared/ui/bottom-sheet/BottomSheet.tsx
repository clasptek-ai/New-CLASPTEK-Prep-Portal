'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-(--backdrop) backdrop-blur-sm animate-fadeIn">
      {/* Backdrop Touch Dismiss */}
      <div className="flex-1" onClick={onClose} aria-hidden="true" />

      {/* Sheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Mobile Sheet'}
        className="w-full bg-(--surface-0) border-t border-(--border) rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl animate-slideUp overflow-hidden"
      >
        {/* Touch Drag Indicator Handle */}
        <div
          className="w-full flex justify-center py-2.5 cursor-grab active:cursor-grabbing"
          onClick={onClose}
        >
          <div className="w-12 h-1.5 bg-(--border-strong) rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-(--border) flex justify-between items-center">
          <h3 className="text-sm font-bold text-(--text-primary) tracking-wide">{title || 'Options'}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-(--surface-1) text-(--text-muted) hover:text-(--text-primary) transition-colors"
            aria-label="Close sheet"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Scroll Region */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[75vh] text-(--text-secondary)">{children}</div>
      </div>
    </div>
  );
}
