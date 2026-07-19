'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { SettingsScreen } from '../../../features/authoring/settings/settings-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <SettingsScreen />
    </AcademicStudioLayout>
  );
}
