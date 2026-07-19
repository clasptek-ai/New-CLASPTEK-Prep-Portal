'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { AuditScreen } from '../../../features/authoring/audit/audit-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <AuditScreen />
    </AcademicStudioLayout>
  );
}
