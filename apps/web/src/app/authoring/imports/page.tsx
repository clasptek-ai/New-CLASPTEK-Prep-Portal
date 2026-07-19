'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { ImportsScreen } from '../../../features/authoring/imports/imports-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <ImportsScreen />
    </AcademicStudioLayout>
  );
}
