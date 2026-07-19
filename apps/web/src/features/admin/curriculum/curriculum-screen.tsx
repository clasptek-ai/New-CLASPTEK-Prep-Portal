'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { adminCurriculumService, AdminModule } from '../../../services/admin/curriculum.service';

export function CurriculumScreen() {
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminCurriculumService.getModules('p1');
        setModules(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleMoveModuleUp(idx: number) {
    if (idx === 0) return;
    const nextModules = [...modules];
    const temp = nextModules[idx];
    nextModules[idx] = nextModules[idx - 1];
    nextModules[idx - 1] = temp;
    setModules(nextModules);
    await adminCurriculumService.reorderModules('p1', nextModules.map(m => m.id));
    showBanner('Module order resequenced successfully!');
  }

  async function handlePublishLesson(lessonId: string) {
    const success = await adminCurriculumService.publishLesson(lessonId);
    if (success) {
      setModules(prev =>
        prev.map(m => ({
          ...m,
          lessons: m.lessons.map(l => (l.id === lessonId ? { ...l, status: 'PUBLISHED' } : l))
        }))
      );
      showBanner('Lesson status published successfully!');
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading dynamic module sequencing timeline...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Academic Curriculum Sequencer</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Reorder lesson structures, verify sequences, and publish lesson versions</p>
      </div>

      {banner && (
        <div style={{ padding: '1rem', backgroundColor: '#10b98120', border: '1px solid #10b98140', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem' }}>
          {banner}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {modules.map((mod, idx) => (
          <Card
            key={mod.id}
            title={`Module ${idx + 1}: ${mod.name}`}
            actions={
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button disabled={idx === 0} onClick={() => handleMoveModuleUp(idx)}>Move Up ▲</Button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {mod.lessons.length === 0 ? (
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>No lessons configured in this module yet.</p>
              ) : (
                mod.lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#111827',
                      borderRadius: '8px',
                      border: '1px solid #1e293b'
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{lesson.title}</span>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Badge variant={lesson.status === 'PUBLISHED' ? 'success' : 'warning'}>{lesson.status}</Badge>
                      {lesson.status !== 'PUBLISHED' && (
                        <Button onClick={() => handlePublishLesson(lesson.id)}>Publish Lesson</Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default CurriculumScreen;
