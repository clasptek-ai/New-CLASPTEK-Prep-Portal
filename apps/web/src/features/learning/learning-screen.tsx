'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../components/ui/ui-components';
import { studentLearningService, EnrolledProgramme } from '../../services/student/learning.service';

export function LearningScreen() {
  const [programmes, setProgrammes] = useState<EnrolledProgramme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await studentLearningService.getEnrolledProgrammes();
        setProgrammes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading syllabus modules and active learning tracks...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          My Enrolled Learning Programs
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Inspect course curriculum blueprints, lesson tracking status logs, and estimated
          completion times
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {programmes.map((prog) => (
          <Card
            key={prog.id}
            title={prog.name}
            actions={<Badge variant="success">{prog.completionPercentage}% Completed</Badge>}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}
            >
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#0b0f19',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                }}
              >
                Estimated remaining: <strong>{prog.estimatedCompletionWeeks} weeks</strong> |
                Current Focus: <strong>{prog.currentModule}</strong>
              </div>

              {prog.modules.map((mod) => (
                <div
                  key={mod.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    borderTop: '1px solid #1e293b',
                    paddingTop: '1rem',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                    Module: {mod.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {mod.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          backgroundColor: '#111827',
                          borderRadius: '8px',
                          border: '1px solid #1e293b',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#cbd5e1' }}>
                            {lesson.title}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                            Duration: {lesson.durationMinutes} mins
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <Badge
                            variant={
                              lesson.status === 'COMPLETED'
                                ? 'success'
                                : lesson.status === 'IN_PROGRESS'
                                  ? 'warning'
                                  : 'info'
                            }
                          >
                            {lesson.status.replace('_', ' ')}
                          </Badge>
                          {lesson.status !== 'COMPLETED' && <Button>Resume Lesson</Button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default LearningScreen;
