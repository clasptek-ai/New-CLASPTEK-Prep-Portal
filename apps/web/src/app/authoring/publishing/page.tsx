'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { PublishingScreen } from '../../../features/authoring/publishing/publishing-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <PublishingScreen />
    </AcademicStudioLayout>
  );
}
