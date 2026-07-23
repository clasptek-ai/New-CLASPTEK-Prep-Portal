import React from 'react';
import { Tooltip } from './Tooltip';

export default {
  title: 'Overlays/Tooltip',
  component: Tooltip,
};

export const Default = () => (
  <Tooltip content="Diagnostic scoring methodology">
    <button style={{ padding: '0.5rem 1.0rem' }}>Info</button>
  </Tooltip>
);
