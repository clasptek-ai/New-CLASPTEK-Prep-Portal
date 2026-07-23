'use client';

import React, { useState } from 'react';
import { Card, Button } from '../../../components/ui/ui-components';

export function CurriculumScreen() {
  const [modules, setModules] = useState([
    { id: 'm1', name: 'Module A: Syntax Modifiers Diagnostics' },
    { id: 'm2', name: 'Module B: Complex Clause Structuring' },
    { id: 'm3', name: 'Module C: Vocabulary active descriptors' },
  ]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...modules];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    setModules(next);
  };

  const moveDown = (index: number) => {
    if (index === modules.length - 1) return;
    const next = [...modules];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    setModules(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Curriculum Builder</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Sequence learning outcome nodes, modules and drag sequencing templates
        </p>
      </div>

      <Card title="Sequenced modules tree">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {modules.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#020617',
                border: '1px solid #1e293b',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                {item.name}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="ghost"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  ▲
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => moveDown(index)}
                  disabled={index === modules.length - 1}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  ▼
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
export default CurriculumScreen;
