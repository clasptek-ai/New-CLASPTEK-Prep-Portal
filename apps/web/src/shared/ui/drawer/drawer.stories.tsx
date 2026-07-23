import React from 'react';
import { Drawer } from './Drawer';

export default {
  title: 'Overlays/Drawer',
  component: Drawer,
};

export const Default = () => (
  <Drawer isOpen={true} onClose={() => {}} title="Filter Diagnostics">
    Drawer side panel contents
  </Drawer>
);
