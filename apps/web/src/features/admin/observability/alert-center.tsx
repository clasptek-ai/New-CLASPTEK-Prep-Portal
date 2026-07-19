'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';
import { AlertCard } from '../../../components/admin/observability/observability-components';

export function AlertCenterScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Platform Alert Center</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Monitor real-time system alerts, logs alerts, and warning triggers queue</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AlertCard severity="CRITICAL" category="API" message="OpenAI API rate-limiting limits reached. Retrying connection..." timestamp="2m ago" />
        <AlertCard severity="WARNING" category="INFRA" message="Database connection pools active at 85% capacity limits" timestamp="12m ago" />
        <AlertCard severity="INFO" category="WIDGETS" message="Operations dashboard custom layout config saved" timestamp="1h ago" />
      </div>
    </div>
  );
}
export default AlertCenterScreen;
