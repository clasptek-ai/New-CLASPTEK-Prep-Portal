import React from 'react';
import { Textarea } from './Textarea';

export default {
  title: 'Forms/Textarea',
  component: Textarea,
};

export const Default = () => (
  <Textarea label="Essay Response" placeholder="Type your essay response..." />
);
