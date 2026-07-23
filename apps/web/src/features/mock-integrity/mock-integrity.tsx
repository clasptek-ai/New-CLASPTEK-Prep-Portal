'use client';

import React from 'react';

export interface MockIntegrityProps {
  warningCount: number;
  maxWarnings: number;
  onDismiss: () => void;
}

export function MockIntegrityBanner({ warningCount, maxWarnings, onDismiss }: MockIntegrityProps) {
  if (warningCount === 0) return null;

  return (
    <div className="bg-amber-950 border-b border-amber-600 text-amber-200 px-4 py-3 flex justify-between items-center text-sm font-semibold">
      <span>
        ⚠️ Integrity Warning ({warningCount}/{maxWarnings}): Fullscreen exit or window blur
        detected. Session will auto-lock if limit is reached.
      </span>
      <button onClick={onDismiss} className="underline hover:text-white">
        Acknowledge
      </button>
    </div>
  );
}
