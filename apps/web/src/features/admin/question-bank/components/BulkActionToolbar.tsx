import React, { useState } from 'react';
import { Button, Badge } from '../../../../components/ui/ui-components';
import {
  CheckSquare,
  CheckCircle2,
  Archive,
  Trash2,
  BookOpen,
  Layers,
  Download,
  X,
  Sliders,
  Sparkles,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { QuestionUsage, DifficultyLevel, Passage } from '../../../../services/admin/questions.service';

interface BulkActionToolbarProps {
  selectedCount: number;
  totalFilteredCount: number;
  selectAllFiltered: boolean;
  passages: Passage[];
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  onBulkPublish: () => void;
  onBulkUnpublish: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onBulkAssignUsages: (usages: QuestionUsage[]) => void;
  onBulkUpdateDifficulty: (difficulty: DifficultyLevel) => void;
  onBulkMoveToPassage: (passageId: string, passageTitle?: string) => void;
  onBulkExport: (format: 'CSV' | 'EXCEL' | 'JSON') => void;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  totalFilteredCount,
  selectAllFiltered,
  passages,
  onSelectAllFiltered,
  onClearSelection,
  onBulkPublish,
  onBulkUnpublish,
  onBulkArchive,
  onBulkDelete,
  onBulkAssignUsages,
  onBulkUpdateDifficulty,
  onBulkMoveToPassage,
  onBulkExport,
}) => {
  const [showUsageMenu, setShowUsageMenu] = useState(false);
  const [showDiffMenu, setShowDiffMenu] = useState(false);
  const [showPassageMenu, setShowPassageMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [selectedUsages, setSelectedUsages] = useState<QuestionUsage[]>([
    'DIAGNOSTIC',
    'PRACTICE',
    'MOCK',
  ]);

  if (selectedCount === 0) return null;

  return (
    <div
      style={{
        position: 'sticky',
        top: '1rem',
        zIndex: 900,
        backgroundColor: '#111827',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
        borderRadius: '14px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        transition: 'all 200ms ease',
      }}
    >
      {/* Top Banner Row: Selection Count & Gmail-style Extension Link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}>
            <CheckSquare size={18} />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
              {selectedCount} {selectedCount === 1 ? 'Question' : 'Questions'} Selected
            </span>
          </div>

          {!selectAllFiltered && totalFilteredCount > selectedCount && (
            <button
              onClick={onSelectAllFiltered}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Select all {totalFilteredCount.toLocaleString()} matching questions in repository
            </button>
          )}

          {selectAllFiltered && (
            <Badge variant="info">All {totalFilteredCount.toLocaleString()} Matching Selected</Badge>
          )}
        </div>

        <button
          onClick={onClearSelection}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <X size={14} /> Clear Selection
        </button>
      </div>

      {/* Action Buttons Toolbar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Workflow Actions */}
        <Button
          variant="success"
          size="sm"
          onClick={onBulkPublish}
          style={{ gap: '0.35rem', backgroundColor: '#10b981', color: '#ffffff' }}
        >
          <CheckCircle2 size={14} /> Publish
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onBulkUnpublish}
          style={{ gap: '0.35rem', color: '#cbd5e1' }}
        >
          <RotateCcw size={14} /> Unpublish
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onBulkArchive}
          style={{ gap: '0.35rem', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}
        >
          <Archive size={14} /> Archive
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={onBulkDelete}
          style={{ gap: '0.35rem', backgroundColor: '#dc2626', color: '#ffffff' }}
        >
          <Trash2 size={14} /> Delete
        </Button>

        {/* Classification Actions: Assign Usages */}
        <div style={{ position: 'relative' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowUsageMenu(!showUsageMenu)}
            style={{ gap: '0.35rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
          >
            <Layers size={14} /> Assign Usage <ChevronDown size={12} />
          </Button>

          {showUsageMenu && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '0.75rem',
                zIndex: 1000,
                width: '220px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                Select Blueprint Usages
              </div>
              {(['DIAGNOSTIC', 'PRACTICE', 'MOCK'] as const).map((u) => {
                const checked = selectedUsages.includes(u);
                return (
                  <label
                    key={u}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      color: '#f8fafc',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsages((prev) => [...prev, u]);
                        } else {
                          setSelectedUsages((prev) => prev.filter((x) => x !== u));
                        }
                      }}
                    />
                    <span>{u}</span>
                  </label>
                );
              })}
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onBulkAssignUsages(selectedUsages);
                  setShowUsageMenu(false);
                }}
                style={{ marginTop: '0.35rem', fontSize: '0.75rem' }}
              >
                Apply Usages
              </Button>
            </div>
          )}
        </div>

        {/* Set Difficulty */}
        <div style={{ position: 'relative' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDiffMenu(!showDiffMenu)}
            style={{ gap: '0.35rem', color: '#cbd5e1' }}
          >
            <Sliders size={14} /> Set Difficulty <ChevronDown size={12} />
          </Button>

          {showDiffMenu && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '0.5rem',
                zIndex: 1000,
                width: '150px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    onBulkUpdateDifficulty(d);
                    setShowDiffMenu(false);
                  }}
                  style={{
                    padding: '0.4rem 0.6rem',
                    textAlign: 'left',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Move to Passage */}
        <div style={{ position: 'relative' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPassageMenu(!showPassageMenu)}
            style={{ gap: '0.35rem', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' }}
          >
            <BookOpen size={14} /> Move to Passage <ChevronDown size={12} />
          </Button>

          {showPassageMenu && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '0.5rem',
                zIndex: 1000,
                width: '240px',
                maxHeight: '200px',
                overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              {passages.map((pas) => (
                <button
                  key={pas.id}
                  onClick={() => {
                    onBulkMoveToPassage(pas.id, pas.title);
                    setShowPassageMenu(false);
                  }}
                  style={{
                    padding: '0.4rem 0.6rem',
                    textAlign: 'left',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#f8fafc',
                    fontSize: '0.785rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {pas.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <div style={{ position: 'relative' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{ gap: '0.35rem', color: '#cbd5e1' }}
          >
            <Download size={14} /> Export <ChevronDown size={12} />
          </Button>

          {showExportMenu && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '0.5rem',
                zIndex: 1000,
                width: '140px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              {(['CSV', 'EXCEL', 'JSON'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    onBulkExport(fmt);
                    setShowExportMenu(false);
                  }}
                  style={{
                    padding: '0.4rem 0.6rem',
                    textAlign: 'left',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Export {fmt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
