'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { ResourcesScreen } from '../../../features/authoring/learning-resources/resources-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <ResourcesScreen />
    </AcademicStudioLayout>
  );
}
