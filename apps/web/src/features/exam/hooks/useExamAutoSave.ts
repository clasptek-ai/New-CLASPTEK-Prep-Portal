import { useEffect, useRef, useCallback } from 'react';

export interface UseExamAutoSaveOptions {
  sessionId: string;
  answers: Record<string, any>;
  onSave: (answers: Record<string, any>) => Promise<void>;
  intervalMs?: number;
}

export function useExamAutoSave({
  sessionId: _sessionId,
  answers,
  onSave,
  intervalMs = 30000,
}: UseExamAutoSaveOptions) {
  const latestAnswers = useRef(answers);
  latestAnswers.current = answers;

  const performSave = useCallback(async () => {
    try {
      await onSave(latestAnswers.current);
    } catch (error) {
      console.warn('[AutoSave] Save failed, queuing retry...', error);
      setTimeout(async () => {
        try {
          await onSave(latestAnswers.current);
        } catch (retryError) {
          console.error('[AutoSave] Retry failed:', retryError);
        }
      }, 5000);
    }
  }, [onSave]);

  // 1. Every 30 seconds auto-save timer
  useEffect(() => {
    const timer = setInterval(() => {
      performSave();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [performSave, intervalMs]);

  // 2. Before page refresh / window unload protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      performSave();
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [performSave]);

  return { performSave };
}
