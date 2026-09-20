'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentDetailRedirectPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/admin/users/${encodeURIComponent(id)}`);
    } else {
      router.replace('/admin/users');
    }
  }, [router, id]);

  return null;
}
