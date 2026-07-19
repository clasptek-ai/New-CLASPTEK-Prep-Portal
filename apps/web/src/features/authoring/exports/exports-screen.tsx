'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function ExportsScreen() {
  return (
    <Card title="Export Center">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Export selected modules, curriculum structures, or exams in CSV, PDF, or Excel grids.
      </p>
    </Card>
  );
}
export default ExportsScreen;
