'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { instructorFeedbackService, InstructorNoteItem } from '../../../services/instructor/feedback.service';

export function FeedbackScreen() {
  const [notes, setNotes] = useState<InstructorNoteItem[]>([]);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<InstructorNoteItem['category']>('ACADEMIC');
  const [visibility, setVisibility] = useState<InstructorNoteItem['visibility']>('PUBLIC');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await instructorFeedbackService.getNotes('s2');
        setNotes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const [notification, setNotification] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const newItem = await instructorFeedbackService.addNote({
      studentId: 's2',
      category,
      visibility,
      content
    });

    setNotes(prev => [newItem, ...prev]);
    setContent('');
    setNotification('Instructor note logged successfully!');
    setTimeout(() => setNotification(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading notes history...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Permanent Instructor Notes</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Audit academic notes, assignments reviews, and diagnostic mock comments</p>
        </div>

        {notification && (
          <div style={{ padding: '1rem', backgroundColor: '#10b98120', border: '1px solid #10b98140', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem' }}>
            {notification}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notes.map(note => (
            <Card key={note.id} title={`${note.instructorName} — ${note.category}`} actions={<Badge>{note.visibility}</Badge>}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>{note.content}</p>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(note.timestamp).toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Card title="Add Academic Note">
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Note Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48' }}
              >
                <option value="ACADEMIC">Academic Progress</option>
                <option value="ASSIGNMENT">Assignment Review</option>
                <option value="MOCK">Mock Review</option>
                <option value="GENERAL">General Log</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Visibility Level</label>
              <select
                value={visibility}
                onChange={e => setVisibility(e.target.value as any)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48' }}
              >
                <option value="PUBLIC">Visible to Student & Admin</option>
                <option value="ADMIN_ONLY">Visible to Admins Only</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Notes Details</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                placeholder="Log academic feedback..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48', boxSizing: 'border-box', height: '100px' }}
              />
            </div>
            <Button type="submit">Save Notes Log</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
export default FeedbackScreen;
