'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import {
  instructorAssignmentsService,
  Assignment,
} from '../../../services/instructor/assignments.service';
import {
  instructorProgrammesService,
  Programme,
} from '../../../services/instructor/programmes.service';

export function AssignmentsScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore] = useState(100);
  const [submissionType, setSubmissionType] = useState<Assignment['submissionType']>('FILE');
  const [status, setStatus] = useState<Assignment['status']>('DRAFT');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await instructorAssignmentsService.getAssignments();
        setAssignments(list);
        const progs = await instructorProgrammesService.getProgrammes();
        setProgrammes(progs);
        if (progs.length > 0) {
          setSelectedProgrammeId(progs[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !selectedProgrammeId) return;

    try {
      const newItem = await instructorAssignmentsService.createAssignment({
        title,
        description,
        instructions,
        programmeId: selectedProgrammeId,
        module: 'General Module',
        dueDate,
        maxScore,
        submissionType,
        allowedFileTypes: ['pdf', 'docx'],
        status,
      });

      setAssignments((prev) => [newItem, ...prev]);
      setTitle('');
      setDescription('');
      setInstructions('');
      setDueDate('');
      showNotification('Assignment created successfully!');
    } catch (err) {
      console.error(err);
    }
  }

  const handleUpdateStatus = async (id: string, nextStatus: Assignment['status']) => {
    const success = await instructorAssignmentsService.updateAssignmentStatus(id, nextStatus);
    if (success) {
      setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)));
      showNotification(`Assignment status updated to ${nextStatus}!`);
    }
  };

  function showNotification(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading assignments details...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Manage Assignments</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Define, edit, and schedule cohort homework tasks
          </p>
        </div>

        {notification && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#10b98120',
              border: '1px solid #10b98140',
              borderRadius: '8px',
              color: '#10b981',
              fontSize: '0.85rem',
            }}
          >
            {notification}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {assignments.map((ass) => (
            <Card
              key={ass.id}
              title={ass.title}
              actions={
                <Badge variant={ass.status === 'PUBLISHED' ? 'success' : 'info'}>
                  {ass.status}
                </Badge>
              }
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <p style={{ margin: 0 }}>{ass.description}</p>
                <div style={{ color: '#64748b' }}>
                  Due Date: {ass.dueDate} | Maximum Score: {ass.maxScore}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {ass.status !== 'PUBLISHED' && (
                    <Button onClick={() => handleUpdateStatus(ass.id, 'PUBLISHED')}>Publish</Button>
                  )}
                  {ass.status !== 'CLOSED' && (
                    <Button
                      variant="secondary"
                      onClick={() => handleUpdateStatus(ass.id, 'CLOSED')}
                    >
                      Close
                    </Button>
                  )}
                  {ass.status !== 'ARCHIVED' && (
                    <Button variant="ghost" onClick={() => handleUpdateStatus(ass.id, 'ARCHIVED')}>
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Card title="New Assignment Builder">
          <form
            onSubmit={handleCreate}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                }}
              >
                Target Programme
              </label>
              <select
                value={selectedProgrammeId}
                onChange={(e) => setSelectedProgrammeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#0b0f19',
                  color: '#f8fafc',
                  border: '1px solid #232e48',
                }}
              >
                {programmes.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                }}
              >
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#0b0f19',
                  color: '#f8fafc',
                  border: '1px solid #232e48',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#0b0f19',
                  color: '#f8fafc',
                  border: '1px solid #232e48',
                  boxSizing: 'border-box',
                  height: '80px',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                }}
              >
                Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#0b0f19',
                  color: '#f8fafc',
                  border: '1px solid #232e48',
                  boxSizing: 'border-box',
                  height: '80px',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                }}
              >
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#0b0f19',
                  color: '#f8fafc',
                  border: '1px solid #232e48',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                }}
              >
                Submission Type
              </label>
              <select
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#0b0f19',
                  color: '#f8fafc',
                  border: '1px solid #232e48',
                }}
              >
                <option value="FILE">File Upload</option>
                <option value="TEXT">Online Text Editor</option>
                <option value="HYBRID">Hybrid Text/File</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                }}
              >
                Default Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#0b0f19',
                  color: '#f8fafc',
                  border: '1px solid #232e48',
                }}
              >
                <option value="DRAFT">Save as Draft</option>
                <option value="SCHEDULED">Schedule for Later</option>
                <option value="PUBLISHED">Publish Instantly</option>
              </select>
            </div>
            <Button type="submit" style={{ marginTop: '0.5rem' }}>
              Create Assignment
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
export default AssignmentsScreen;
