'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminDashboardService } from '../services/admin/dashboard.service';
import { getDeterministicId, getDeterministicName } from '../lib/mock-util';
import { useAuthContext } from '../providers/AuthProvider';

export interface AdminWorkspaceContextType {
  adminProfile: { id: string; name: string; role: string; email: string } | null;
  pendingApprovals: number;
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  activeProgrammeId: string | null;
  setActiveProgrammeId: (id: string | null) => void;
  unreadNotificationsCount: number;
  recentActivities: { id: string; action: string; user: string; timestamp: string }[];
  academicTerm: string;
  configSnapshot: Record<string, any>;
  loading: boolean;
  refreshContext: () => Promise<void>;
}

export const AdminWorkspaceContext = createContext<AdminWorkspaceContextType | undefined>(
  undefined
);

export const AdminWorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, roles: authRoles } = useAuthContext();
  const [adminProfile, setAdminProfile] = useState<AdminWorkspaceContextType['adminProfile']>(null);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [systemHealth, setSystemHealth] = useState<'HEALTHY' | 'WARNING' | 'CRITICAL'>('HEALTHY');
  const [activeProgrammeId, setActiveProgrammeId] = useState<string | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<
    AdminWorkspaceContextType['recentActivities']
  >([]);
  const [academicTerm, setAcademicTerm] = useState('Fall 2026');
  const [configSnapshot, setConfigSnapshot] = useState({});
  const [loading, setLoading] = useState(true);

  const refreshContext = async () => {
    try {
      const data = await adminDashboardService.getDashboardData();

      let storedName: string | null = null;
      if (typeof window !== 'undefined') {
        storedName = localStorage.getItem('clasptek_user_name');
      }

      let profile = null;
      if (authUser) {
        profile = {
          id: authUser.id,
          name: storedName || authUser.user_metadata?.name || (authUser.email?.toLowerCase() === 'clasptek@gmail.com' ? 'Clasptek Coaching Limited' : getDeterministicName(authUser.email || 'clasptek@gmail.com')),
          role: authRoles[0] || 'SUPER_ADMINISTRATOR',
          email: authUser.email || 'clasptek@gmail.com',
        };
      }

      if (!profile) {
        profile = {
          id: getDeterministicId('admin-clasptek'),
          name: storedName || 'Clasptek Coaching Limited',
          role: 'SUPER_ADMINISTRATOR',
          email: 'clasptek@gmail.com',
        };
      }

      setAdminProfile(profile);
      setPendingApprovals(5);
      setSystemHealth(data.stats.platformHealth);
      setUnreadNotificationsCount(data.notifications.length);
      setRecentActivities(data.recentActivity);
      setAcademicTerm('Summer-Fall 2026 Term');
      setConfigSnapshot({
        maintenanceMode: false,
        backupsEnabled: true,
        aiCoachModel: 'gpt-4o-mini',
      });
    } catch (e) {
      console.error('Failed to load admin context', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshContext();
  }, [authUser]);

  return (
    <AdminWorkspaceContext.Provider
      value={{
        adminProfile,
        pendingApprovals,
        systemHealth,
        activeProgrammeId,
        setActiveProgrammeId,
        unreadNotificationsCount,
        recentActivities,
        academicTerm,
        configSnapshot,
        loading,
        refreshContext,
      }}
    >
      {children}
    </AdminWorkspaceContext.Provider>
  );
};

export const useAdminWorkspace = () => {
  const context = useContext(AdminWorkspaceContext);
  if (context === undefined) {
    throw new Error('useAdminWorkspace must be used within an AdminWorkspaceProvider');
  }
  return context;
};
