import React, { forwardRef, useState } from 'react';
import { InstructionPanelProps } from './instructions.types';
import { Card } from '../card/Card';

export const InstructionPanel = forwardRef<HTMLDivElement, InstructionPanelProps>(
  function InstructionPanel({ title, rules = [], style, children, ...props }, ref) {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <Card ref={ref} style={{ padding: '1.25rem', ...style }} {...props}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: '1.0rem',
              fontWeight: 700,
              color: 'var(--text-primary, #f8fafc)',
            }}
          >
            📋 {title}
          </h4>
          <span>{isOpen ? '▲' : '▼'}</span>
        </div>

        {isOpen && (
          <div
            style={{
              marginTop: '1.0rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary, #cbd5e1)',
              lineHeight: 1.6,
            }}
          >
            {rules.length > 0 && (
              <ul style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.25rem' }}>
                {rules.map((rule, idx) => (
                  <li key={idx} style={{ marginBottom: '0.35rem' }}>
                    {rule}
                  </li>
                ))}
              </ul>
            )}
            {children}
          </div>
        )}
      </Card>
    );
  }
);

export const ExamRules = InstructionPanel;
export const SectionIntroduction = InstructionPanel;
export const TipsPanel = InstructionPanel;
