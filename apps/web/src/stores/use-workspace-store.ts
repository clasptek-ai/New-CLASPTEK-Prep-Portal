import { create } from 'zustand';
import { WorkspaceId } from '../workspace/workspace-registry';

interface WorkspaceState {
  activeWorkspaceId: WorkspaceId;
  sidebarCollapsed: boolean;
  tableDense: boolean;
  setActiveWorkspaceId: (id: WorkspaceId) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTableDense: (dense: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId: 'STUDENT',
  sidebarCollapsed: false,
  tableDense: false,
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setTableDense: (dense) => set({ tableDense: dense }),
}));
