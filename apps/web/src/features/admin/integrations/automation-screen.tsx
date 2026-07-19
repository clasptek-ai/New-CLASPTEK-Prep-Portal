'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { useNotification } from '../../../providers/notification-provider';

export function AutomationScreen() {
  const [workflows, setWorkflows] = useState([
    { id: '1', trigger: 'Student Mock Exam Completed', condition: 'Score >= 80%', action: 'Unlock Practice Lesson 4', status: 'ACTIVE' },
    { id: '2', trigger: 'Billing Subscription Canceled', condition: 'Grace period expired', action: 'Lock Organization Tenant Access', status: 'ACTIVE' }
  ]);

  const templates = [
    { name: 'Student Registration Preset', description: 'Triggers on student registration, sends welcome email and sets up study plan.' },
    { name: 'Assessment Completion Alerts', description: 'Triggers on assessment submission, pushes notification log to instructor.' },
    { name: 'Certificate Issuance Workflow', description: 'Triggers on program completion, fires automated credential badge.' }
  ];

  const { showSuccess } = useNotification();
  const router = useRouter();

  const handleTriggerRun = (id: string) => {
    showSuccess(`Automation sequence executed manually for Workflow ID ${id}!`);
  };

  const handleAddTemplate = (tpl: typeof templates[0]) => {
    setWorkflows(prev => [
      ...prev,
      {
        id: (prev.length + 1).toString(),
        trigger: tpl.name,
        condition: 'Always true',
        action: 'Notify Channels',
        status: 'ACTIVE'
      }
    ]);
    showSuccess(`Added workflow from template: ${tpl.name}!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Automation Workflows</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Define event triggers, conditional logic pipelines, and system execution actions</p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/admin/integrations')}>Back to Directory</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {workflows.map((flow) => (
          <Card key={flow.id} title={`Workflow #${flow.id}`} actions={<Badge variant="success">{flow.status}</Badge>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>Trigger:</span>
                <span>{flow.trigger}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#3b82f6' }}>Condition:</span>
                <span>{flow.condition}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#10b981' }}>Action:</span>
                <span>{flow.action}</span>
              </div>
              <div style={{ marginTop: '0.5rem', alignSelf: 'flex-end' }}>
                <Button onClick={() => handleTriggerRun(flow.id)}>Run Workflow</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h3 style={{ margin: '1rem 0 0 0', fontSize: '1.1rem', fontWeight: 700 }}>Preset Automation Templates</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {templates.map((tpl, i) => (
          <Card key={i} title={tpl.name}>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#cbd5e1' }}>{tpl.description}</p>
            <Button variant="secondary" onClick={() => handleAddTemplate(tpl)}>Use Template</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default AutomationScreen;
