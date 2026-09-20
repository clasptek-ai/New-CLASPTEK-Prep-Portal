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
import { useTheme } from '../providers/ThemeProvider';

const DEFAULT_NON_THEME_PREFERENCES = {
  sidebarCollapsed: false,
  tableDense: false,
  commandHistory: [] as string[],
};

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

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

  const [storedPrefs, setStoredPrefs] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem('workspace-preferences');
        if (item) {
          const parsed = JSON.parse(item);
          // Delete legacy theme key if present to enforce ThemeProvider as sole authority
          delete parsed.theme;
          return { ...DEFAULT_NON_THEME_PREFERENCES, ...parsed };
        }
      } catch {
        // Storage unavailable
      }
    }
    return DEFAULT_NON_THEME_PREFERENCES;
  });

  // Consolidated preferences view, with theme strictly owned by ThemeProvider
  const preferences: WorkspacePreferences = useMemo(
    () => ({
      ...storedPrefs,
      theme,
    }),
    [storedPrefs, theme]
  );

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
          const { theme: _t, ...toSave } = prefs;
          localStorage.setItem('workspace-preferences', JSON.stringify(toSave));
        } catch {
          /* ignore storage error */
        }
      },
      async loadPreferences() {
        try {
          const item = localStorage.getItem('workspace-preferences');
          if (!item) return null;
          const parsed = JSON.parse(item);
          return { ...parsed, theme };
        } catch {
          return null;
        }
      },
    }),
    [theme]
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
    // 1. Delegate theme changes to the authoritative ThemeProvider
    if (next.theme) {
      setTheme(next.theme);
    }

    // 2. Persist only non-theme workspace preferences
    const { theme: _ignored, ...nonThemePrefs } = next;
    if (Object.keys(nonThemePrefs).length > 0) {
      setStoredPrefs((prev: typeof DEFAULT_NON_THEME_PREFERENCES) => {
        const updated = { ...prev, ...nonThemePrefs };
        try {
          localStorage.setItem('workspace-preferences', JSON.stringify(updated));
        } catch {
          /* ignore */
        }
        return updated;
      });
    }

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
