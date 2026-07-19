'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function ReportsScreen() {
  return (
    <Card title="Operational Reporting Workspace">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Generate operations templates (Daily operations checks, SLA reviews, Security audits summaries).
      </p>
    </Card>
  );
}
export default ReportsScreen;
