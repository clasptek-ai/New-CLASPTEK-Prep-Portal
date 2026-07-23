import React from 'react';
import { Toast } from './Toast';

export default {
  title: 'Feedback/Toast',
  component: Toast,
};

export const Default = () => (
  <Toast
    toast={{ id: '1', message: 'Evaluation submitted successfully!', variant: 'success' }}
    onDismiss={() => {}}
  />
);
