'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { AnalyticsScreen } from '../../../features/authoring/analytics/analytics-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <AnalyticsScreen />
    </AcademicStudioLayout>
  );
}
