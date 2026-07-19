'use client';

import React from 'react';
import { PermissionMatrix } from '../../../components/admin/admin-components';

export function PermissionsScreen() {
  const capabilities = [
    { id: '1', name: 'STUDY_PRACTICE', category: 'Student Practice' },
    { id: '2', name: 'VIEW_ANALYTICS', category: 'Instructor Analytics' },
    { id: '3', name: 'MANAGE_ASSESSMENTS', category: 'Instructor Assessments' },
    { id: '4', name: 'OVERRIDE_AI_SCORES', category: 'Instructor Grading' },
    { id: '5', name: 'PLATFORM_MAINTENANCE', category: 'System Operations' }
  ];

  const roles = [
    { id: 'STUDENT', name: 'Student' },
    { id: 'INSTRUCTOR', name: 'Instructor' },
    { id: 'ADMINISTRATOR', name: 'Administrator' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Permissions Management</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Map privileges hierarchies, simulate effective scopes, and inspect capability sets</p>
      </div>

      <PermissionMatrix capabilities={capabilities} roles={roles} />
    </div>
  );
}
export default PermissionsScreen;
