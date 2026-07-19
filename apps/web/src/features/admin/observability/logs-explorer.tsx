'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function LogsExplorerScreen() {
  return (
    <Card title="Diagnostics Logs Explorer">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Search query histories, filter by Request ID, User, or Organization tenant scope.
      </p>
    </Card>
  );
}
export default LogsExplorerScreen;
