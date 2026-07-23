'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { studentProfileService, StudentProfileDetails } from '../services/student/profile.service';
import {
  studentReadinessService,
  StudentReadinessInfo,
} from '../services/student/readiness.service';
import { studentLearningService, EnrolledProgramme } from '../services/student/learning.service';
import { studentNotificationsService } from '../services/student/notifications.service';

export interface StudentWorkspaceContextType {
  student: StudentProfileDetails | null;
  programme: EnrolledProgramme | null;
  readiness: StudentReadinessInfo | null;
  notificationCount: number;
  learningProgress: number;
  loading: boolean;
  refreshContext: () => Promise<void>;
}

export const StudentWorkspaceContext = createContext<StudentWorkspaceContextType | undefined>(
  undefined
);

export const StudentWorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentProfileDetails | null>(null);
  const [programme, setProgramme] = useState<EnrolledProgramme | null>(null);
  const [readiness, setReadiness] = useState<StudentReadinessInfo | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [learningProgress, setLearningProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshContext = async () => {
    try {
      // 1. Verify active authentication session before requesting authenticated student domain data
      const sessionRes = await fetch('/api/v1/auth/session');
      if (!sessionRes.ok) {
        setLoading(false);
        return;
      }

      // 2. Auth session verified — load student domain data concurrently
      const [studentData, readinessData, programmes, notifs] = await Promise.all([
        studentProfileService.getProfile().catch(() => null),
        studentReadinessService.getReadiness().catch(() => null),
        studentLearningService.getEnrolledProgrammes().catch(() => []),
        studentNotificationsService.getNotifications().catch(() => []),
      ]);

      if (studentData) setStudent(studentData);
      if (readinessData) setReadiness(readinessData);

      if (programmes && programmes.length > 0) {
        setProgramme(programmes[0]);
        setLearningProgress(programmes[0].completionPercentage);
      }

      if (notifs) {
        setNotificationCount(notifs.filter((n) => !n.read).length);
      }
    } catch (e) {
      console.error('Failed to load student workspace context', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshContext();
  }, []);

  return (
    <StudentWorkspaceContext.Provider
      value={{
        student,
        programme,
        readiness,
        notificationCount,
        learningProgress,
        loading,
        refreshContext,
      }}
    >
      {children}
    </StudentWorkspaceContext.Provider>
  );
};

export const useStudentWorkspace = () => {
  const context = useContext(StudentWorkspaceContext);
  if (context === undefined) {
    throw new Error('useStudentWorkspace must be used within a StudentWorkspaceProvider');
  }
  return context;
};
