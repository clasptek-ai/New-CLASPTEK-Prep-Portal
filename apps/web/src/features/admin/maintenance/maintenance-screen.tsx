'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { useNotification } from '../../../providers/notification-provider';

export function MaintenanceScreen() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { showSuccess, showInfo, showWarning } = useNotification();

  const toggleMaintenance = () => {
    const nextMode = !maintenanceMode;
    setMaintenanceMode(nextMode);
    if (nextMode) {
      showWarning('Maintenance Mode active. Public routes locked.');
    } else {
      showSuccess('Maintenance Mode deactivated. Platform is live!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Maintenance Workspace</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Schedule downtime windows, run manual database backups, and clean caches</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <Card title="Downtime Settings" actions={<Badge variant={maintenanceMode ? 'danger' : 'success'}>{maintenanceMode ? 'ACTIVE' : 'OFFLINE'}</Badge>}>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
            Toggle maintenance mode to restrict incoming users API calls during system upgrades.
          </p>
          <Button onClick={toggleMaintenance}>
            {maintenanceMode ? 'Unlock Platform' : 'Enter Maintenance Mode'}
          </Button>
        </Card>

        <Card title="System Tools & Controls">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => showInfo('Triggering database snapshot backup...')}>Backup database</Button>
            <Button variant="secondary" onClick={() => showInfo('Clearing redis memory cache...')}>Clear cache</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default MaintenanceScreen;
