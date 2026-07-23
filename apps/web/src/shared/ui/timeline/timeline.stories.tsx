import React from 'react';
import { Timeline, TimelineItem } from './Timeline';

export default {
  title: 'Data Display/Timeline',
  component: Timeline,
};

export const Default = () => (
  <Timeline>
    <TimelineItem date="10:00 AM" title="Listening Practice Started" isCompleted />
    <TimelineItem date="10:35 AM" title="Listening Practice Submitted" isCompleted />
  </Timeline>
);
