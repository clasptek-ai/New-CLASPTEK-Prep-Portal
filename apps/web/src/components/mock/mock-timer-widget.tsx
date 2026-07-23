'use client';

import React, { useState, useEffect } from 'react';

interface MockTimerWidgetProps {
  initialSeconds: number;
  onTimeExpired?: () => void;
}

export const MockTimerWidget: React.FC<MockTimerWidgetProps> = ({
  initialSeconds,
  onTimeExpired,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      if (onTimeExpired) onTimeExpired();
      return;
    }
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds, onTimeExpired]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isWarning = seconds < 300;

  return (
    <div
      className={`px-4 py-2 rounded-lg font-mono font-bold text-lg flex items-center gap-2 border ${
        isWarning
          ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse'
          : 'bg-zinc-800 text-emerald-400 border-zinc-700'
      }`}
    >
      <span>⏱️</span>
      <span>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
};
