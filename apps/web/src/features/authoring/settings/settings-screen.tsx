'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function SettingsScreen() {
  return (
    <Card title="Authoring Studio Settings">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Set workflow reviewers targets, default metadata templates, and publication options.
      </p>
    </Card>
  );
}
export default SettingsScreen;
