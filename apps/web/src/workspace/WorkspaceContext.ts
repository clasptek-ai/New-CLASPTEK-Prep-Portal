'use client';

import { createContext } from 'react';
import { WorkspaceId, WorkspaceDefinition } from './workspace-registry';

export type WorkspaceEventType =
  | 'WorkspaceChanged'
  | 'ThemeChanged'
  | 'PreferenceUpdated'
  | 'NotificationReceived'
  | 'CommandExecuted'
  | 'SidebarCollapsed'
  | 'WidgetConfigured'
  | 'SearchExecuted';

export interface WorkspacePreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  tableDense: boolean;
  commandHistory: string[];
}

export interface WorkspaceEventBus {
  emit: (event: WorkspaceEventType, payload?: any) => void;
  subscribe: (event: WorkspaceEventType, callback: (payload?: any) => void) => () => void;
}

export interface PreferenceSyncProvider {
  savePreferences: (prefs: WorkspacePreferences) => Promise<void>;
  loadPreferences: () => Promise<WorkspacePreferences | null>;
}

export interface WorkspaceContextProps {
  currentWorkspace: WorkspaceDefinition;
  setWorkspaceId: (id: WorkspaceId) => void;
  preferences: WorkspacePreferences;
  updatePreferences: (next: Partial<WorkspacePreferences>) => void;
  eventBus: WorkspaceEventBus;
  syncProvider: PreferenceSyncProvider;
}

export const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);
