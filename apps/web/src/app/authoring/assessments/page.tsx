'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { AssessmentsScreen } from '../../../features/authoring/assessments/assessments-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <AssessmentsScreen />
    </AcademicStudioLayout>
  );
}
