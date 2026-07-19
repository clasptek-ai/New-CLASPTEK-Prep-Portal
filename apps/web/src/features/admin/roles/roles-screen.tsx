'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function RolesScreen() {
  return (
    <Card title="Roles Configuration">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Create role titles, clone hierarchy, and assign members profiles.
      </p>
    </Card>
  );
}
export default RolesScreen;
