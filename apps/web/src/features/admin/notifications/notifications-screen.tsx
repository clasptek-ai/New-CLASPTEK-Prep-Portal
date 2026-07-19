'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function NotificationsScreen() {
  return (
    <Card title="Notification Template Library">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Preview notification templates (System alerts, reminders notes, security locks, account setup).
      </p>
    </Card>
  );
}
export default NotificationsScreen;
