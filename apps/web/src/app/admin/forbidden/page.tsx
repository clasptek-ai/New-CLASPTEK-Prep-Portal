'use client';

import React from 'react';
import { ForbiddenAccessScreen } from '@/shared/auth/rbac-guard';

export default function AdminForbiddenPage() {
  return (
    <ForbiddenAccessScreen reason="Students do not have permission to access the Enterprise Administration Workspace." />
  );
}
