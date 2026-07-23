'use client';

import React, { useState } from 'react';
import { Card, Badge, Button, Input } from '../ui/ui-components';

// ─── Rich Text Editor Abstraction Stub ──────────────────────────────
export interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const applyStubFormatting = (tag: string) => {
    onChange(`${value} **${tag}**`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Editor toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          backgroundColor: '#0f172a',
          padding: '0.5rem',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <button
          type="button"
          onClick={() => applyStubFormatting('Bold')}
          style={{
            padding: '0.2rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
          }}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => applyStubFormatting('Italic')}
          style={{
            padding: '0.2rem 0.5rem',
            fontSize: '0.75rem',
            fontStyle: 'italic',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
          }}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => applyStubFormatting('Code')}
          style={{
            padding: '0.2rem 0.5rem',
            fontSize: '0.75rem',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
          }}
        >
          &lt;/&gt;
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Type here...'}
        style={{
          width: '100%',
          height: '120px',
          padding: '0.75rem',
          border: 'none',
          backgroundColor: '#020617',
          color: '#f8fafc',
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

// ─── Reusable Metadata Editor ───────────────────────────────────────
export interface AcademicMetadata {
  title: string;
  description: string;
  tags: string[];
  competencies: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  visibility: 'PUBLIC' | 'PRIVATE';
  author: string;
  reviewer: string;
}

export function MetadataEditor({
  metadata,
  onChange,
}: {
  metadata: AcademicMetadata;
  onChange: (next: AcademicMetadata) => void;
}) {
  return (
    <Card title="Asset Metadata Configuration">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Title"
          value={metadata.title}
          onChange={(e) => onChange({ ...metadata, title: e.target.value })}
          required
        />
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#94a3b8',
              marginBottom: '0.5rem',
            }}
          >
            Description
          </label>
          <textarea
            value={metadata.description}
            onChange={(e) => onChange({ ...metadata, description: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #1e293b',
              backgroundColor: '#020617',
              color: '#f8fafc',
            }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: '0.5rem',
              }}
            >
              Difficulty
            </label>
            <select
              value={metadata.difficulty}
              onChange={(e) => onChange({ ...metadata, difficulty: e.target.value as any })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #1e293b',
                backgroundColor: '#020617',
                color: '#f8fafc',
              }}
            >
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: '0.5rem',
              }}
            >
              Visibility
            </label>
            <select
              value={metadata.visibility}
              onChange={(e) => onChange({ ...metadata, visibility: e.target.value as any })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #1e293b',
                backgroundColor: '#020617',
                color: '#f8fafc',
              }}
            >
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Version Diff Viewer with Dynamic Timeline Switcher ──────────────
interface VersionNode {
  version: number;
  date: string;
  author: string;
  content: string;
}

export function VersionDiffWorkspace({ versions }: { versions: VersionNode[] }) {
  const [selectedIdx, setSelectedIdx] = useState(versions.length - 1);
  const current = versions[selectedIdx];
  const previous = selectedIdx > 0 ? versions[selectedIdx - 1] : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', width: '100%' }}>
      {/* Dynamic timeline sidebar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          borderRight: '1px solid #1e293b',
          paddingRight: '1rem',
        }}
      >
        <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Version Timeline</h4>
        {versions.map((ver, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIdx(idx)}
            style={{
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: selectedIdx === idx ? '#10b981' : '#1e293b',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            v{ver.version} - {ver.author}
          </button>
        ))}
      </div>

      {/* Diff comparison pane */}
      <Card
        title={`Comparing: Version ${current.version} with ${previous ? `Version ${previous.version}` : 'Original Draft'}`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444' }}>
              PREVIOUS / BASELINE
            </span>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.1)',
                fontSize: '0.85rem',
                color: '#cbd5e1',
                whiteSpace: 'pre-wrap',
                marginTop: '0.5rem',
              }}
            >
              {previous ? previous.content : 'No previous version details recorded.'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>
              CURRENT SELECTION
            </span>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                fontSize: '0.85rem',
                color: '#cbd5e1',
                whiteSpace: 'pre-wrap',
                marginTop: '0.5rem',
              }}
            >
              {current.content}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Publishing Pipeline Visualizer ──────────────────────────────
export type PipelineState =
  'DRAFT' | 'REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export function PublishingPipelineVisualizer({ state }: { state: PipelineState }) {
  const steps: PipelineState[] = [
    'DRAFT',
    'REVIEW',
    'APPROVED',
    'SCHEDULED',
    'PUBLISHED',
    'ARCHIVED',
  ];
  const activeIdx = steps.indexOf(state);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        overflowX: 'auto',
        padding: '1rem 0',
      }}
    >
      {steps.map((step, idx) => {
        const isPast = idx < activeIdx;
        const isCurrent = idx === activeIdx;
        return (
          <React.Fragment key={step}>
            <div
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: isCurrent ? '#10b981' : isPast ? '#06b6d4' : '#1e293b',
                color: '#f8fafc',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {step}
            </div>
            {idx < steps.length - 1 && (
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>➔</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
