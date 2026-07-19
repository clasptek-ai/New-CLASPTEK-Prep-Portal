'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { ProgrammesScreen } from '../../../features/authoring/programmes/programmes-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <ProgrammesScreen />
    </AcademicStudioLayout>
  );
}
