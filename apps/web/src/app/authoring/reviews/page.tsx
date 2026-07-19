'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { ReviewsScreen } from '../../../features/authoring/reviews/reviews-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <ReviewsScreen />
    </AcademicStudioLayout>
  );
}
