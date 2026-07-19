'use client';

import React, { use } from 'react';
import { AcademicStudioLayout } from '../../../../layouts/academic-layout';
import { ProgrammesScreen } from '../../../../features/authoring/programmes/programmes-screen';

interface PageProps {
  params: Promise<{ programmeId: string }>;
}

export default function Page({ params }: PageProps) {
  const { programmeId } = use(params);

  return (
    <AcademicStudioLayout>
      <ProgrammesScreen programmeId={programmeId} />
    </AcademicStudioLayout>
  );
}
