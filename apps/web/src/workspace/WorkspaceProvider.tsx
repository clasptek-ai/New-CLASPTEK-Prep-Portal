'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  WorkspaceContext,
  WorkspacePreferences,
  WorkspaceEventBus,
  WorkspaceEventType,
  PreferenceSyncProvider,
} from './WorkspaceContext';
import { WorkspaceId, getWorkspace } from './workspace-registry';

const DEFAULT_PREFERENCES: WorkspacePreferences = {
  theme: 'dark',
  sidebarCollapsed: false,
  tableDense: false,
  commandHistory: [],
};

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<WorkspaceId>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedId = localStorage.getItem('active-workspace-id') as WorkspaceId;
        if (savedId && ['STUDENT', 'ADMIN'].includes(savedId)) return savedId;
      } catch {
        // Storage unavailable
      }
    }
    return 'STUDENT';
  });

  const [preferences, setPreferences] = useState<WorkspacePreferences>(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem('workspace-preferences');
        if (item) return { ...DEFAULT_PREFERENCES, ...JSON.parse(item) };
      } catch {
        // Storage unavailable
      }
    }
    return DEFAULT_PREFERENCES;
  });

  // Event bus listener mappings
  const listenersRef = useRef<Record<string, Set<(p?: any) => void>>>({});

  const eventBus = useMemo<WorkspaceEventBus>(
    () => ({
      emit(event: WorkspaceEventType, payload?: any) {
        const set = listenersRef.current[event];
        if (set) {
          set.forEach((cb) => cb(payload));
        }
      },
      subscribe(event: WorkspaceEventType, callback: (p?: any) => void) {
        if (!listenersRef.current[event]) {
          listenersRef.current[event] = new Set();
        }
        listenersRef.current[event].add(callback);
        return () => {
          listenersRef.current[event]?.delete(callback);
        };
      },
    }),
    []
  );

  // Preference Persistence sync implementation
  const syncProvider = useMemo<PreferenceSyncProvider>(
    () => ({
      async savePreferences(prefs: WorkspacePreferences) {
        try {
          localStorage.setItem('workspace-preferences', JSON.stringify(prefs));
        } catch {
          /* ignore storage error */
        }
      },
      async loadPreferences() {
        try {
          const item = localStorage.getItem('workspace-preferences');
          return item ? JSON.parse(item) : null;
        } catch {
          return null;
        }
      },
    }),
    []
  );

  const setWorkspaceId = (id: WorkspaceId) => {
    setActiveId(id);
    try {
      localStorage.setItem('active-workspace-id', id);
    } catch {
      /* ignore storage error */
    }
    eventBus.emit('WorkspaceChanged', id);
  };

  const updatePreferences = (next: Partial<WorkspacePreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...next };
      syncProvider.savePreferences(updated);
      return updated;
    });
    eventBus.emit('PreferenceUpdated', next);
  };

  const currentWorkspace = useMemo(() => getWorkspace(activeId), [activeId]);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        setWorkspaceId,
        preferences,
        updatePreferences,
        eventBus,
        syncProvider,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
export default WorkspaceProvider;
