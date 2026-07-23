import React from 'react';
import { RadioGroup } from './RadioGroup';

export default {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
};

const opts = [
  { value: 'ielts', label: 'IELTS Academic' },
  { value: 'toefl', label: 'TOEFL iBT' },
];

export const Default = () => <RadioGroup name="exam" label="Target Exam" options={opts} />;
