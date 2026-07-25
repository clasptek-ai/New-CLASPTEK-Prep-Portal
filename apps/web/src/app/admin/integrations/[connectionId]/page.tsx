'use client';

import React, { use } from 'react';
import { ConnectionWorkspace } from '@/features/admin/integrations/connection-workspace';

interface PageProps {
  params: Promise<{ connectionId: string }>;
}

export default function Page({ params }: PageProps) {
  const { connectionId } = use(params);

  return <ConnectionWorkspace connectionId={connectionId} />;
}
