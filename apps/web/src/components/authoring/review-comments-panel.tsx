'use client';

import React, { useState } from 'react';
import { Card, Button, Input } from '../ui/ui-components';

export interface ReviewComment {
  id: string;
  author: string;
  section: string;
  comment: string;
  timestamp: string;
}

export function ReviewCommentsPanel({ initialComments }: { initialComments: ReviewComment[] }) {
  const [comments, setComments] = useState<ReviewComment[]>(initialComments);
  const [section, setSection] = useState('');
  const [commentText, setCommentText] = useState('');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!section.trim() || !commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        author: 'Lead Reviewer',
        section,
        comment: commentText,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setSection('');
    setCommentText('');
  };

  return (
    <Card title="Review Collaboration Comments">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxHeight: '180px',
            overflowY: 'auto',
          }}
        >
          {comments.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: '#020617',
                border: '1px solid #1e293b',
                fontSize: '0.8rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem',
                }}
              >
                <strong style={{ color: '#10b981' }}>
                  [{c.section}] {c.author}
                </strong>
                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{c.timestamp}</span>
              </div>
              <p style={{ margin: 0, color: '#cbd5e1' }}>{c.comment}</p>
            </div>
          ))}
        </div>

        <form
          onSubmit={handlePost}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <Input
            placeholder="Section reference..."
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
          />
          <textarea
            placeholder="Write comments..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
            style={{
              width: '100%',
              height: '50px',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #1e293b',
              backgroundColor: '#020617',
              color: '#f8fafc',
              fontSize: '0.8rem',
            }}
          />
          <Button type="submit">Post Comment</Button>
        </form>
      </div>
    </Card>
  );
}
export default ReviewCommentsPanel;
