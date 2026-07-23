'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '../../../components/ui/ui-components';
import {
  instructorProgrammesService,
  Programme,
} from '../../../services/instructor/programmes.service';

export function InstructorProgrammesScreen() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  useEffect(() => {
    async function load() {
      const data = await instructorProgrammesService.getProgrammes();
      setProgrammes(data);
    }
    load();
  }, []);

  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>My Assigned Programmes</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Monitor syllabus progression and class readiness levels
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {programmes.map((prog) => (
          <Card key={prog.id} title={prog.name}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                fontSize: '0.85rem',
                color: '#cbd5e1',
              }}
            >
              <p style={{ margin: 0 }}>{prog.description}</p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#0b0f19',
                  borderRadius: '6px',
                }}
              >
                <div>
                  Duration: <strong>{prog.duration}</strong>
                </div>
                <div>
                  Students: <strong>{prog.studentsEnrolled}</strong>
                </div>
                <div>
                  Resources: <strong>{prog.resourcesCount}</strong>
                </div>
                <div>
                  Assignments: <strong>{prog.assignmentsCount}</strong>
                </div>
              </div>
              <div
                style={{
                  borderTop: '1px solid #232e48',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  Avg Progress: <strong>{prog.averageProgress}%</strong>
                </span>
                <span>
                  Avg Readiness: <strong>{prog.averageReadiness}%</strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Button onClick={() => router.push(`/instructor/students?programmeId=${prog.id}`)}>
                  View Students
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/instructor/resources?programmeId=${prog.id}`)}
                >
                  Upload Resource
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
