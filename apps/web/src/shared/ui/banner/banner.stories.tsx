import React from 'react';
import { Banner } from './Banner';

export default {
  title: 'Feedback/Banner',
  component: Banner,
};

export const Default = () => (
  <Banner variant="info">New Speaking Evaluation AI Engine V2 is live!</Banner>
);
