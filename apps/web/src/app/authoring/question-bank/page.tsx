'use client';

import React from 'react';
import { AcademicStudioLayout } from '../../../layouts/academic-layout';
import { QuestionBankScreen } from '../../../features/authoring/question-bank/question-bank-screen';

export default function Page() {
  return (
    <AcademicStudioLayout>
      <QuestionBankScreen />
    </AcademicStudioLayout>
  );
}
