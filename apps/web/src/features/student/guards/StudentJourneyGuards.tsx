import React from 'react';
import { StudentExamPolicy } from '@clasptek/application-student-learning';

export interface GuardProps {
  children: React.ReactNode;
  hasCompletedDiagnostic: boolean;
  hasCompletedPractice?: boolean;
  isAdminUnlocked?: boolean;
  fallback?: React.ReactNode;
}

export const RequireDiagnostic: React.FC<GuardProps> = ({
  children,
  hasCompletedDiagnostic,
  fallback = (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
      <h2>Diagnostic Required</h2>
      <p>
        You must complete the initial Diagnostic Placement assessment before accessing this area.
      </p>
    </div>
  ),
}) => {
  if (StudentExamPolicy.isDiagnosticRequired(hasCompletedDiagnostic)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export const RequirePracticeUnlock: React.FC<GuardProps> = ({
  children,
  hasCompletedDiagnostic,
  isAdminUnlocked = false,
  fallback = (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
      <h2>Practice Session Locked</h2>
      <p>Practice mode is locked pending initial Diagnostic completion and Admin approval.</p>
    </div>
  ),
}) => {
  if (!StudentExamPolicy.isPracticeUnlocked(hasCompletedDiagnostic, isAdminUnlocked)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export const RequireMockUnlock: React.FC<GuardProps> = ({
  children,
  hasCompletedPractice = false,
  isAdminUnlocked = false,
  fallback = (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
      <h2>Mock Examination Locked</h2>
      <p>Mock examinations are locked pending Practice completion and Admin approval.</p>
    </div>
  ),
}) => {
  if (!StudentExamPolicy.isMockUnlocked(hasCompletedPractice, isAdminUnlocked)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export const PreventCompletedAttemptEditing: React.FC<{
  isSubmitted: boolean;
  children: React.ReactNode;
}> = ({ isSubmitted, children }) => {
  if (isSubmitted) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <h2>Attempt Submitted</h2>
        <p>This assessment attempt has already been submitted and is immutable.</p>
      </div>
    );
  }
  return <>{children}</>;
};
