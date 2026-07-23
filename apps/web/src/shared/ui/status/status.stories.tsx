import React from 'react';
import { StatusBadge } from './StatusBadge';

export default {
  title: 'Status/StatusBadge',
  component: StatusBadge,
};

export const Default = () => <StatusBadge variant="success" label="Certified Enterprise" />;
