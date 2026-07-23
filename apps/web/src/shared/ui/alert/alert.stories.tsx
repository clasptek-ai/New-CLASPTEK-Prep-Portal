import React from 'react';
import { Alert, AlertTitle, AlertDescription } from './Alert';

export default {
  title: 'Feedback/Alert',
  component: Alert,
};

export const Default = () => (
  <Alert variant="info">
    <AlertTitle>Information</AlertTitle>
    <AlertDescription>Your diagnostic exam starts in 10 minutes.</AlertDescription>
  </Alert>
);
