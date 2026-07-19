'use client';

import React, { use } from 'react';
import { AcademicStudioLayout } from '../../../../layouts/academic-layout';
import { QuestionBankScreen } from '../../../../features/authoring/question-bank/question-bank-screen';

interface PageProps {
  params: Promise<{ questionId: string }>;
}

export default function Page({ params }: PageProps) {
  const { questionId } = use(params);

  return (
    <AcademicStudioLayout>
      <QuestionBankScreen questionId={questionId} />
    </AcademicStudioLayout>
  );
}
