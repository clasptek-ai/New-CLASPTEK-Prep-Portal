'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function HealthScreen() {
  return (
    <Card title="Provider Health and Latency monitoring">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Track rate limits usage, DNS latency timings, and authentication status per provider.
      </p>
    </Card>
  );
}
export default HealthScreen;
