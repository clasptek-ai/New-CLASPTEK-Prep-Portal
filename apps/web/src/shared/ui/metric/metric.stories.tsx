import React from 'react';
import { Metric } from './Metric';

export default {
  title: 'Data Display/Metric',
  component: Metric,
};

export const Default = () => (
  <Metric
    label="Overall IELTS Band"
    value="8.0"
    percentageChange="+0.5"
    trend="up"
    period="last week"
  />
);
