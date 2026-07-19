'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function SettingsScreen() {
  return (
    <Card title="Observability Configuration settings">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Setup alerts thresholds logic, dashboard layouts, and refresh intervals options.
      </p>
    </Card>
  );
}
export default SettingsScreen;
