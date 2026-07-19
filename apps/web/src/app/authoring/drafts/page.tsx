'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { DraftsScreen } from '../../../features/authoring/drafts/drafts-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <DraftsScreen />
    </AcademicStudioLayout>
  );
}
