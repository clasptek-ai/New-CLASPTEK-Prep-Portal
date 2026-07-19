'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { instructorResourcesService, LearningResourceItem } from '../../../services/instructor/resources.service';
import { instructorProgrammesService, Programme } from '../../../services/instructor/programmes.service';

export function ResourcesScreen() {
  const [resources, setResources] = useState<LearningResourceItem[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<LearningResourceItem['resourceType']>('PDF');
  const [lesson, setLesson] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [difficulty, setDifficulty] = useState<LearningResourceItem['difficulty']>('MEDIUM');
  const [visibility, setVisibility] = useState<LearningResourceItem['visibility']>('PUBLIC');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await instructorResourcesService.getResources();
        setResources(data);
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

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !selectedProgrammeId) return;

    try {
      const newItem = await instructorResourcesService.uploadResource({
        title,
        description,
        resourceType,
        lesson,
        module: moduleName,
        programmeId: selectedProgrammeId,
        tags: ['Syllabus'],
        difficulty,
        visibility,
        fileUrl: 'https://supabase.co/storage/v1/object/public/resources/mock_upload.pdf',
        storageBucket: 'resources',
        mimeType: 'application/pdf',
        fileSizeBytes: 102400,
        uploadedBy: 'inst-active', // Set dynamically by runtime context mock
        uploadedAt: new Date().toISOString(),
        version: 1
      });

      setResources(prev => [newItem, ...prev]);
      setTitle('');
      setDescription('');
      setLesson('');
      setModuleName('');
      showNotification('Resource uploaded successfully!');
    } catch (err) {
      console.error(err);
    }
  }

  function showNotification(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading learning resources...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Learning Resources Repository</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Manage diagnostic guides, files uploads, and download analytics</p>
        </div>

        {notification && (
          <div style={{ padding: '1rem', backgroundColor: '#10b98120', border: '1px solid #10b98140', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem' }}>
            {notification}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {resources.map(res => (
            <Card key={res.id} title={res.title} actions={<Badge>{res.resourceType}</Badge>}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ margin: 0 }}>{res.description}</p>
                <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.75rem' }}>
                  <span>Lesson: <strong>{res.lesson}</strong></span>
                  <span>Difficulty: <strong>{res.difficulty}</strong></span>
                  <span>Downloads: <strong>{res.downloads}</strong></span>
                  <span>Views: <strong>{res.views}</strong></span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Card title="Upload New Resource">
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Target Programme</label>
              <select
                value={selectedProgrammeId}
                onChange={e => setSelectedProgrammeId(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48' }}
              >
                {programmes.map(prog => (
                  <option key={prog.id} value={prog.id}>{prog.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Resource Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48', boxSizing: 'border-box', height: '60px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Resource Type</label>
              <select
                value={resourceType}
                onChange={e => setResourceType(e.target.value as any)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48' }}
              >
                <option value="PDF">PDF Document</option>
                <option value="DOCX">Word Document</option>
                <option value="PPTX">Powerpoint Slide</option>
                <option value="VIDEO">Video Lecture</option>
                <option value="IMAGE">Image Diagram</option>
                <option value="ZIP">ZIP Package</option>
                <option value="LINK">External Link</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Lesson Name</label>
              <input
                type="text"
                value={lesson}
                onChange={e => setLesson(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Module Name</label>
              <input
                type="text"
                value={moduleName}
                onChange={e => setModuleName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48' }}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Visibility</label>
              <select
                value={visibility}
                onChange={e => setVisibility(e.target.value as any)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#0b0f19', color: '#f8fafc', border: '1px solid #232e48' }}
              >
                <option value="PUBLIC">Visible to All Students</option>
                <option value="PRIVATE">Draft (Private)</option>
              </select>
            </div>
            <Button type="submit">Upload Resource</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
export default ResourcesScreen;
