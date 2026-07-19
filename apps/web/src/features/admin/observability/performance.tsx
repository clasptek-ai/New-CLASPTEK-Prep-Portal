'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function PerformanceScreen() {
  return (
    <Card title="Page Performance & Latencies Analytics">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Track rendering times, LCP metrics, network waterfalls, and JS bundle sizes trends.
      </p>
    </Card>
  );
}
export default PerformanceScreen;
