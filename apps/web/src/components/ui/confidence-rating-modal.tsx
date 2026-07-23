'use client';

import React from 'react';
import { Button } from './ui-components';

export function ConfidenceRatingModal({
  onSelectConfidence,
}: {
  onSelectConfidence: (level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPERT') => void;
}) {
  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: '#151d30',
        border: '1px solid #232e48',
        borderRadius: '8px',
        marginTop: '1rem',
      }}
    >
      <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.9rem', color: '#f8fafc' }}>
        Rate Your Answer Confidence
      </h4>
      <p style={{ margin: 0, marginBottom: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
        How confident are you in your response? This feeds into our Adaptive Difficulty Engine.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        <Button variant="ghost" onClick={() => onSelectConfidence('LOW')}>
          Low (25%)
        </Button>
        <Button variant="ghost" onClick={() => onSelectConfidence('MEDIUM')}>
          Medium (50%)
        </Button>
        <Button variant="secondary" onClick={() => onSelectConfidence('HIGH')}>
          High (75%)
        </Button>
        <Button variant="primary" onClick={() => onSelectConfidence('EXPERT')}>
          Expert (100%)
        </Button>
      </div>
    </div>
  );
}
