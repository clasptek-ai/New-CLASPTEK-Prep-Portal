'use client';

import React, { use } from 'react';
import { IncidentWorkspace } from '@/features/admin/observability/incident-workspace';

interface PageProps {
  params: Promise<{ incidentId: string }>;
}

export default function Page({ params }: PageProps) {
  const { incidentId } = use(params);

  return <IncidentWorkspace incidentId={incidentId} />;
}
