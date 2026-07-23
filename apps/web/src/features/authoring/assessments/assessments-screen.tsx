'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function AssessmentsScreen() {
  return (
    <Card title="Assessment Builder Workspace">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Select questions, outline instructions guides, specify timer limits, and configure randomize
        rules.
      </p>
    </Card>
  );
}
export default AssessmentsScreen;
