import { useState, useEffect, useCallback } from 'react';

export interface QueuedAnswer {
  questionId: string;
  answer: any;
  timestamp: number;
}

export function useOfflineAnswerQueue(
  sessionId: string,
  syncService: (answers: QueuedAnswer[]) => Promise<void>
) {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const STORAGE_KEY = `cds-offline-answers-${sessionId}`;

  const getQueue = useCallback((): QueuedAnswer[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }, [STORAGE_KEY]);

  const queueAnswer = useCallback(
    (questionId: string, answer: any) => {
      const queue = getQueue();
      const existingIdx = queue.findIndex((item) => item.questionId === questionId);
      const newItem: QueuedAnswer = { questionId, answer, timestamp: Date.now() };

      if (existingIdx >= 0) {
        queue[existingIdx] = newItem;
      } else {
        queue.push(newItem);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    },
    [STORAGE_KEY, getQueue]
  );

  const syncQueue = useCallback(async () => {
    const queue = getQueue();
    if (queue.length === 0) return;

    try {
      await syncService(queue);
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('[OfflineQueue] Failed to sync offline queue:', e);
    }
  }, [STORAGE_KEY, getQueue, syncService]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncQueue();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue]);

  return { isOffline, queueAnswer, syncQueue, queueCount: getQueue().length };
}
