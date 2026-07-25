'use client';

import React, { useState } from 'react';
import { Card, Button } from '../../../components/ui/ui-components';
import { PublishingPipelineVisualizer } from '../../../components/authoring/authoring-components';
import { useNotification } from '../../../providers/notification-provider';

export function PublishingScreen() {
  const { showSuccess, showWarning, showInfo } = useNotification();
  const [pipelineState, setPipelineState] = useState<
    'DRAFT' | 'REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  >('APPROVED');

  const releaseNotes =
    'Release baseline content mappings updates for Syntax Modifiers courses modules.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Publishing Center</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Schedule module releases, write release logs, and run rollbacks
        </p>
      </div>

      <Card title="Release Pipeline Status">
        <PublishingPipelineVisualizer state={pipelineState} />
        {pipelineState === 'APPROVED' && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <Button
              onClick={() => {
                setPipelineState('PUBLISHED');
                showSuccess('Asset published successfully!');
              }}
            >
              Immediate Release
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setPipelineState('SCHEDULED');
                showInfo('Scheduled for Wednesday!');
              }}
            >
              Schedule Publish
            </Button>
          </div>
        )}
        {pipelineState === 'PUBLISHED' && (
          <div style={{ marginTop: '1.5rem' }}>
            <Button
              variant="ghost"
              onClick={() => {
                setPipelineState('APPROVED');
                showWarning('Asset rollbacked to approved status.');
              }}
              style={{ color: '#ef4444' }}
            >
              Rollback Release
            </Button>
          </div>
        )}
      </Card>

      <Card title="Release Log comments Details">
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>{releaseNotes}</p>
      </Card>
    </div>
  );
}
export default PublishingScreen;
