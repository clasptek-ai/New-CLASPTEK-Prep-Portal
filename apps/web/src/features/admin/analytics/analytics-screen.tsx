'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function AnalyticsScreen() {
  return (
    <Card title="Platform Analytics">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Visualize platform usage index, growth trends, active sessions per institution, storage load growth.
      </p>
    </Card>
  );
}
export default AnalyticsScreen;
