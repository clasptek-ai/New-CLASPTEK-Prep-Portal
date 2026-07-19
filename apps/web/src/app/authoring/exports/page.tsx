'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { ExportsScreen } from '../../../features/authoring/exports/exports-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <ExportsScreen />
    </AcademicStudioLayout>
  );
}
