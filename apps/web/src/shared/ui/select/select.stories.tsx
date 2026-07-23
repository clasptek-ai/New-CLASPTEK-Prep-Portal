import React from 'react';
import { Select } from './Select';

export default {
  title: 'Forms/Select',
  component: Select,
};

const opts = [
  { value: 'ielts', label: 'IELTS Preparation' },
  { value: 'toefl', label: 'TOEFL iBT' },
];

export const Default = () => <Select label="Select Exam" options={opts} />;
