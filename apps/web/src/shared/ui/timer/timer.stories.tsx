import React from 'react';
import { AssessmentTimer } from './AssessmentTimer';

export default {
  title: 'Assessment/AssessmentTimer',
  component: AssessmentTimer,
};

export const Default = () => <AssessmentTimer seconds={2400} />;
