import React from 'react';
import { RecordingIndicator } from './RecordingIndicator';

export default {
  title: 'Assessment/RecordingIndicator',
  component: RecordingIndicator,
};

export const Default = () => <RecordingIndicator status="recording" elapsedSeconds={32} />;
