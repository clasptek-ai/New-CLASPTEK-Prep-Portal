'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function SettingsScreen() {
  return (
    <Card title="Workspace Settings">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Configure instructor profile details, session logs, preferences, and permissions lists.
      </p>
    </Card>
  );
}
export default SettingsScreen;
