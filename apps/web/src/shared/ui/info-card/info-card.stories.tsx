import React from 'react';
import { StatCard } from './StatCard';

export default {
  title: 'Data Display/StatCard',
  component: StatCard,
};

export const Default = () => (
  <StatCard title="Target Band Score" value="8.0" delta="+0.5" trend="up" />
);
