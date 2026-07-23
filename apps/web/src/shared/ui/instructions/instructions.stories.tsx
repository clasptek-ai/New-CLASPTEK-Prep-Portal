import React from 'react';
import { InstructionPanel } from './InstructionPanel';

export default {
  title: 'Assessment/InstructionPanel',
  component: InstructionPanel,
};

export const Default = () => (
  <InstructionPanel
    title="Section 1 Directions"
    rules={['Listen to the audio recording carefully.']}
  />
);
