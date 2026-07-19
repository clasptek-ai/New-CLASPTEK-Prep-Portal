'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function ImportsScreen() {
  return (
    <Card title="Import Center">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Import questions or modules via CSV, JSON, or Excel spreadsheets templates.
      </p>
    </Card>
  );
}
export default ImportsScreen;
