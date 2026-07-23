import React from 'react';
import { Card } from './Card';

export default {
  title: 'Foundation/Card',
  component: Card,
};

export const Default = () => <Card>Default Card Container</Card>;
export const Elevated = () => <Card variant="elevated">Elevated Metric Card</Card>;
export const Outlined = () => <Card variant="outlined">Outlined Card Container</Card>;
