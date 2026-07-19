'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { CurriculumScreen } from '../../../features/authoring/curriculum/curriculum-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <CurriculumScreen />
    </AcademicStudioLayout>
  );
}
