'use client';

import React, { use } from 'react';
import { OrganizationsScreen } from '@/features/admin/organizations/organizations-screen';

interface PageProps {
  params: Promise<{ orgId: string }>;
}

export default function Page({ params }: PageProps) {
  const { orgId } = use(params);

  return <OrganizationsScreen orgId={orgId} />;
}
