import React from 'react';

export interface StrengthMeterProps {
  score: 0 | 1 | 2 | 3 | 4;
}

export function StrengthMeter({ score }: StrengthMeterProps) {
  const getLabel = () => {
    switch (score) {
      case 0:
        return 'Weak';
      case 1:
        return 'Fair';
      case 2:
        return 'Good';
      case 3:
        return 'Strong';
      case 4:
        return 'Very Strong';
      default:
        return 'Weak';
    }
  };

  const getColor = () => {
    switch (score) {
      case 0:
        return '#ef4444';
      case 1:
        return '#f97316';
      case 2:
        return '#eab308';
      case 3:
        return '#3b82f6';
      case 4:
        return '#10b981';
      default:
        return '#ef4444';
    }
  };

  return (
    <div style={{ marginTop: '0.35rem' }}>
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
        {[0, 1, 2, 3].map((step) => (
          <div
            key={step}
            style={{
              height: '4px',
              flex: 1,
              backgroundColor: step <= score - 1 ? getColor() : 'var(--border-default, #1e293b)',
              borderRadius: '2px',
              transition: 'background-color 200ms ease',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: getColor(), fontWeight: 600 }}>
        Password Strength: {getLabel()}
      </span>
    </div>
  );
}
