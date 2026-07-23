import React from 'react';
import { AudioPlayer } from './AudioPlayer';

export default {
  title: 'Assessment/AudioPlayer',
  component: AudioPlayer,
};

export const Default = () => <AudioPlayer src="/demo.mp3" title="Part 1 Audio Track" />;
