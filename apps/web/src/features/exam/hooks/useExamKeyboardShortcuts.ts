import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  onNext: () => void;
  onPrevious: () => void;
  onFlag: () => void;
}

export function useExamKeyboardShortcuts({ onNext, onPrevious, onFlag }: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevious();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        onFlag();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrevious, onFlag]);
}
