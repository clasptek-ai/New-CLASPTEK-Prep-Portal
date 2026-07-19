'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function LogsScreen() {
  return (
    <Card title="Synchronizations & Connections Logs">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Audit connection history, synchronization latency warnings, and API response logs.
      </p>
    </Card>
  );
}
export default LogsScreen;
