'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { SharedTable } from '../../../components/ui/shared-table';
import { VersionDiffWorkspace, MetadataEditor, RichEditor, AcademicMetadata } from '../../../components/authoring/authoring-components';
import { authoringQuestionBankService, AuthoringQuestion } from '../../../services/authoring/question-bank.service';
import { useNotification } from '../../../providers/notification-provider';

export function QuestionBankScreen({ questionId }: { questionId?: string }) {
  const router = useRouter();
  const { showSuccess, showInfo } = useNotification();
  const [questions, setQuestions] = useState<AuthoringQuestion[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<AuthoringQuestion | null>(null);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'PREVIEW' | 'METADATA' | 'DIFF'>('DETAILS');

  const [metadata, setMetadata] = useState<AcademicMetadata>({
    title: '',
    description: '',
    tags: ['Grammar'],
    competencies: ['Syntax'],
    difficulty: 'MEDIUM',
    visibility: 'PUBLIC',
    author: 'Jane Doe',
    reviewer: 'Bob Smith'
  });

  const [questionText, setQuestionText] = useState('');

  useEffect(() => {
    async function load() {
      const list = await authoringQuestionBankService.getQuestions();
      setQuestions(list);
      if (questionId) {
        const item = list.find(q => q.id === questionId) || list[0];
        setSelectedQuest(item);
        setMetadata({
          title: item.title,
          description: `Description outlines for: ${item.title}`,
          tags: ['Grammar'],
          competencies: item.competencies,
          difficulty: item.difficulty,
          visibility: 'PUBLIC' as const,
          author: 'Jane Doe',
          reviewer: 'Bob Smith'
        });
        setQuestionText(item.body);
      }
    }
    load();
  }, [questionId]);

  const columns = [
    {
      id: 'title',
      header: 'Question Name',
      cell: (info: any) => (
        <span style={{ fontWeight: 600, color: '#10b981', cursor: 'pointer' }} onClick={() => router.push(`/authoring/question-bank/${info.row.id}`)}>
          {info.row.title}
        </span>
      ),
      sortable: true
    },
    {
      id: 'difficulty',
      header: 'Difficulty',
      cell: (info: any) => <span>{info.row.difficulty}</span>
    },
    {
      id: 'status',
      header: 'Status',
      cell: (info: any) => (
        <Badge variant={info.row.status === 'PUBLISHED' ? 'success' : 'info'}>
          {info.row.status}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info: any) => (
        <Button onClick={() => router.push(`/authoring/question-bank/${info.row.id}`)}>
          Configure Workspace
        </Button>
      )
    }
  ];

  if (selectedQuest) {
    const mockVersions = [
      { version: 1, date: '2026-07-10', author: 'Jane Doe', content: 'Identify adjectives.' },
      { version: 2, date: '2026-07-15', author: 'Jane Doe', content: selectedQuest.body }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{selectedQuest.title}</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Status: {selectedQuest.status} | Version: v{selectedQuest.version}</p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/authoring/question-bank')}>Back to Questions list</Button>
        </div>

        {/* Workspace tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
          {(['DETAILS', 'PREVIEW', 'METADATA', 'DIFF'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.6rem 1.25rem',
                border: 'none',
                backgroundColor: activeTab === tab ? '#10b981' : 'transparent',
                color: activeTab === tab ? '#f8fafc' : '#94a3b8',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'DETAILS' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            <Card title="Rich Question Editor">
              <RichEditor value={questionText} onChange={setQuestionText} placeholder="Enter dynamic question body details here..." />
            </Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Button onClick={() => showSuccess('Question saved as Draft!')}>Save Draft</Button>
              <Button variant="secondary" onClick={() => showInfo('Submitted draft for peer review approval!')}>Submit for Review</Button>
            </div>
          </div>
        )}

        {activeTab === 'PREVIEW' && (
          <Card title="Question Preview Player">
            <div style={{ padding: '1rem', border: '1px solid #1e293b', borderRadius: '8px', backgroundColor: '#020617', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <p>{questionText}</p>
            </div>
          </Card>
        )}

        {activeTab === 'METADATA' && (
          <MetadataEditor metadata={metadata} onChange={setMetadata} />
        )}

        {activeTab === 'DIFF' && (
          <VersionDiffWorkspace versions={mockVersions} />
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Question Bank Studio</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Create diagnostic templates, tagging attributes, and versions diffs</p>
      </div>

      <SharedTable
        data={questions}
        columns={columns}
      />
    </div>
  );
}
export default QuestionBankScreen;
