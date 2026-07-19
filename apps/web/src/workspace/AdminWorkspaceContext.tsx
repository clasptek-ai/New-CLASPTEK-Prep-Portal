'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminDashboardService, AdminDashboardAggregatedData } from '../services/admin/dashboard.service';
import { getDeterministicId, getDeterministicName } from '../lib/mock-util';

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

export const AdminWorkspaceContext = createContext<AdminWorkspaceContextType | undefined>(undefined);

export const AdminWorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminProfile, setAdminProfile] = useState<AdminWorkspaceContextType['adminProfile']>(null);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [systemHealth, setSystemHealth] = useState<'HEALTHY' | 'WARNING' | 'CRITICAL'>('HEALTHY');
  const [activeProgrammeId, setActiveProgrammeId] = useState<string | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<AdminWorkspaceContextType['recentActivities']>([]);
  const [academicTerm, setAcademicTerm] = useState('Fall 2026');
  const [configSnapshot, setConfigSnapshot] = useState({});
  const [loading, setLoading] = useState(true);

  const refreshContext = async () => {
    try {
      const data = await adminDashboardService.getDashboardData();
      
      let profile = null;
      try {
        const sessionRes = await fetch('/api/v1/auth/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.user) {
            const user = sessionData.user;
            profile = {
              id: user.id,
              name: user.user_metadata?.name || getDeterministicName(user.email || 'admin@clasptek.com'),
              role: sessionData.roles?.[0] || 'SUPER_ADMINISTRATOR',
              email: user.email || ''
            };
          }
        }
      } catch (authErr) {
        console.warn('Could not resolve admin session, using offline mock mode', authErr);
      }

      if (!profile) {
        profile = {
          id: getDeterministicId('admin-sarah'),
          name: 'Sarah Jenkins',
          role: 'SUPER_ADMINISTRATOR',
          email: 'sarah.jenkins@admin.clasptek.com'
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
        aiCoachModel: 'gpt-4o-mini'
      });
    } catch (e) {
      console.error('Failed to load admin context', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshContext();
  }, []);

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
        refreshContext
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
