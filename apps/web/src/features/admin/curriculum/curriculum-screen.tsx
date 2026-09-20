'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { PageContainer, PageContent } from '../../../shared/ui/layout/PageContainer';
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
    await adminCurriculumService.reorderModules(
      'p1',
      nextModules.map((m) => m.id)
    );
    showBanner('Module order resequenced successfully!');
  }

  async function handlePublishLesson(lessonId: string) {
    const success = await adminCurriculumService.publishLesson(lessonId);
    if (success) {
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, status: 'PUBLISHED' } : l)),
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
      <PageContainer>
        <PageContent>
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>Loading dynamic module sequencing timeline...</h3>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
              }}
            >
              Academic Curriculum Sequencer
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Reorder lesson structures, verify sequences, and publish lesson versions
            </p>
          </div>

          {banner && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--success)',
                borderRadius: '8px',
                color: 'var(--success)',
                fontSize: '0.85rem',
              }}
            >
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
                    <Button disabled={idx === 0} onClick={() => handleMoveModuleUp(idx)}>
                      Move Up ▲
                    </Button>
                  </div>
                }
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginTop: '1rem',
                  }}
                >
                  {mod.lessons.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No lessons configured in this module yet.
                    </p>
                  ) : (
                    mod.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          backgroundColor: 'var(--surface-1)',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {lesson.title}
                        </span>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <Badge variant={lesson.status === 'PUBLISHED' ? 'success' : 'warning'}>
                            {lesson.status}
                          </Badge>
                          {lesson.status !== 'PUBLISHED' && (
                            <Button onClick={() => handlePublishLesson(lesson.id)}>
                              Publish Lesson
                            </Button>
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
      </PageContent>
    </PageContainer>
  );
}
export default CurriculumScreen;
