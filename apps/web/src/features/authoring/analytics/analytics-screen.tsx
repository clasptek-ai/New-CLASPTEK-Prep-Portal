'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function AnalyticsScreen() {
  return (
    <Card title="Authoring Studio Analytics">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Track content creation rates, reviewer approval frequencies, and question bank coverage.
      </p>
    </Card>
  );
}
export default AnalyticsScreen;
