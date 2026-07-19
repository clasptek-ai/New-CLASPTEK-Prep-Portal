'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';

export function InterventionsScreen() {
  const [interventions, setInterventions] = useState([
    { id: '1', student: 'Jane Smith', risk: 'HIGH', readiness: '58%', recommendation: 'Schedule direct grammar practice lesson reviews', status: 'PENDING' },
    { id: '2', student: 'Bob Johnson', risk: 'MEDIUM', readiness: '71%', recommendation: 'Assign vocabulary vocabulary intensive tasks', status: 'ACTIVE' }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  function handleTriggerIntervention(id: string) {
    setInterventions(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'ACTIVE' } : item))
    );
    setNotification('Intervention activated! Follow-up plan loaded into student AI Coach stream.');
    setTimeout(() => setNotification(null), 3000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Intervention Center</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Monitor at-risk predictions alerts and trigger escalation paths</p>
      </div>

      {notification && (
        <div style={{ padding: '1rem', backgroundColor: '#10b98120', border: '1px solid #10b98140', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem' }}>
          {notification}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {interventions.map((item, index) => (
          <Card key={index} title={item.student} actions={<Badge variant={item.risk === 'HIGH' ? 'danger' : 'warning'}>{item.risk} RISK</Badge>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  Current Readiness Index: **{item.readiness}**
                </p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                  Recommendation: {item.recommendation}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: item.status === 'ACTIVE' ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                  Status: {item.status}
                </span>
                {item.status === 'PENDING' && (
                  <Button onClick={() => handleTriggerIntervention(item.id)}>
                    Trigger Escalation
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default InterventionsScreen;
