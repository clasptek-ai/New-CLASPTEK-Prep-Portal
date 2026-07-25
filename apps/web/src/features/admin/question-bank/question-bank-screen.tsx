'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { adminQuestionsService, AdminQuestion } from '../../../services/admin/questions.service';
import {
  Plus,
  Upload,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Search,
  BookOpen,
  Award,
} from 'lucide-react';

export function QuestionBankScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedProgramme, setSelectedProgramme] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<AdminQuestion | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Create Form State
  const [newPrompt, setNewPrompt] = useState('');
  const [newType, setNewType] = useState<'MCQ' | 'ESSAY' | 'SPEAKING'>('MCQ');
  const [newDifficulty, setNewDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [newTopic, setNewTopic] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newProgramme, setNewProgramme] = useState('IELTS Academic');
  const [newCategory, setNewCategory] = useState<'MOCK' | 'ASSESSMENT'>('MOCK');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminQuestionsService.getPendingQuestions();
        setQuestions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleApprove(id: string) {
    const success = await adminQuestionsService.approveQuestion(id);
    if (success) {
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, status: 'PUBLISHED' } : q)));
      showBanner('Question approved & published to candidate banks!');
    }
  }

  async function handleReject(id: string) {
    const success = await adminQuestionsService.rejectQuestion(
      id,
      'Fails curriculum modifiers specifications.'
    );
    if (success) {
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, status: 'ARCHIVED' } : q)));
      showBanner('Question rejected & archived.');
    }
  }

  function handleDelete(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setDeleteConfirmId(null);
    if (previewQuestion?.id === id) setPreviewQuestion(null);
    showBanner('Question removed from Question Bank database.');
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newPrompt.trim() || !newTopic.trim()) return;

    const created: AdminQuestion = {
      id: `q-custom-${Date.now()}`,
      text: newPrompt,
      type: newType,
      difficulty: newDifficulty,
      status: 'APPROVED',
      topic: newTopic,
      learningObjective: newObjective || 'General Proficiency Assessment',
      programmeName: newProgramme,
      category: newCategory,
    };

    await adminQuestionsService.addQuestion(created);
    setQuestions((prev) => [created, ...prev]);
    setCreateModalOpen(false);
    resetForm();
    showBanner(
      `New question created for ${newProgramme} (${newCategory === 'MOCK' ? 'Mock Exam' : 'Skill Assessment'})!`
    );
  }

  function resetForm() {
    setNewPrompt('');
    setNewTopic('');
    setNewObjective('');
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3500);
  }

  // Filtered List
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'ALL' || q.type === selectedType;
    const matchesProgramme = selectedProgramme === 'ALL' || q.programmeName === selectedProgramme;
    const matchesCategory = selectedCategory === 'ALL' || q.category === selectedCategory;

    return matchesSearch && matchesDifficulty && matchesType && matchesProgramme && matchesCategory;
  });

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading Question Bank Registry...</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header & Actions Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.02em',
            }}
          >
            Question Bank Management
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            Author, audit, filter by Programme and Assessment Target (Mock vs Diagnostic), and
            publish items.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            onClick={() => router.push('/admin/question-bank/import')}
            style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}
          >
            <Upload size={16} color="#fbbf24" />
            <span>Import Centre (CSV/ZIP)</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              gap: '0.5rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Plus size={16} />
            <span>Create New Question</span>
          </Button>
        </div>
      </div>

      {banner && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '8px',
            color: '#34d399',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{banner}</span>
        </div>
      )}

      {/* Filter & Search Toolbar with Programme & Category Selection */}
      <Card
        style={{
          padding: '1.25rem',
          borderRadius: '14px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              flex: 1,
              minWidth: '220px',
            }}
          >
            <Search size={16} color="#94a3b8" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts, topics..."
              style={{
                background: 'none',
                border: 'none',
                color: '#f8fafc',
                outline: 'none',
                width: '100%',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.85rem' }}>
            {/* Programme Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                Programme:
              </span>
              <select
                value={selectedProgramme}
                onChange={(e) => setSelectedProgramme(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  color: '#38bdf8',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                }}
              >
                <option value="ALL">All Programmes</option>
                <option value="General (All Programmes)">General (All Programmes)</option>
                <option value="IELTS Academic">IELTS Academic</option>
                <option value="IELTS General Training">IELTS General</option>
                <option value="TOEFL iBT">TOEFL iBT</option>
                <option value="SAT">SAT</option>
                <option value="CELPIP">CELPIP</option>
                <option value="English Proficiency">English Proficiency</option>
              </select>
            </div>

            {/* Target Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                Target Category:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  color: '#a78bfa',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="MOCK">🎓 Official Mock Exams</option>
                <option value="ASSESSMENT">📝 Skill Assessments</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                Difficulty:
              </span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  color: '#f8fafc',
                  fontSize: '0.825rem',
                }}
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Question Table List */}
      <Card
        style={{
          padding: '1.25rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
            color: '#f8fafc',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Question Prompt</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Programme</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Category</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Difficulty</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No questions match your programme & category filter criteria.
                </td>
              </tr>
            ) : (
              filteredQuestions.map((q) => (
                <tr key={q.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.85rem 1rem', maxWidth: '340px' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: '#f8fafc',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {q.text}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Topic: {q.topic} | Type: {q.type}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge variant="info">{q.programmeName || 'IELTS Academic'}</Badge>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge variant={q.category === 'MOCK' ? 'primary' : 'neutral'}>
                      {q.category === 'MOCK' ? '🎓 MOCK' : '📝 ASSESSMENT'}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge
                      variant={
                        q.difficulty === 'HARD'
                          ? 'danger'
                          : q.difficulty === 'MEDIUM'
                            ? 'warning'
                            : 'success'
                      }
                    >
                      {q.difficulty}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge
                      variant={
                        q.status === 'PUBLISHED' || q.status === 'APPROVED'
                          ? 'success'
                          : q.status === 'ARCHIVED'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {q.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <Button
                        variant="secondary"
                        onClick={() => setPreviewQuestion(q)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.75rem',
                          gap: '0.3rem',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Eye size={14} /> Preview
                      </Button>

                      {q.status === 'PENDING_REVIEW' && (
                        <>
                          <Button
                            variant="primary"
                            onClick={() => handleApprove(q.id)}
                            style={{
                              backgroundColor: '#10b981',
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.75rem',
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleReject(q.id)}
                            style={{
                              color: '#f87171',
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.75rem',
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      <Button
                        variant="secondary"
                        onClick={() => setDeleteConfirmId(q.id)}
                        style={{ color: '#ef4444', padding: '0.35rem 0.5rem' }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* CREATE NEW QUESTION MODAL WITH PROGRAMME AND CATEGORY SELECTORS */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                Create New Assessment Question
              </h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleCreateQuestion}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Target Programme *
                  </label>
                  <select
                    value={newProgramme}
                    onChange={(e) => setNewProgramme(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      backgroundColor: '#161e2e',
                      border: '1px solid #1e293b',
                      color: '#ffffff',
                      fontSize: '0.825rem',
                    }}
                  >
                    <option value="General (All Programmes)">General (All Programmes)</option>
                    <option value="IELTS Academic">IELTS Academic</option>
                    <option value="IELTS General Training">IELTS General Training</option>
                    <option value="TOEFL iBT">TOEFL iBT</option>
                    <option value="SAT">SAT</option>
                    <option value="CELPIP">CELPIP</option>
                    <option value="English Proficiency">English Proficiency</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Assessment Target Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const cat = e.target.value as 'MOCK' | 'ASSESSMENT';
                      setNewCategory(cat);
                      if (cat === 'ASSESSMENT') {
                        setNewProgramme('General (All Programmes)');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      backgroundColor: '#161e2e',
                      border: '1px solid #1e293b',
                      color: '#ffffff',
                      fontSize: '0.825rem',
                    }}
                  >
                    <option value="ASSESSMENT">
                      📝 Skill Assessment (General for All Programmes)
                    </option>
                    <option value="MOCK">🎓 Official Mock Exam (Programme Specific)</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '0.35rem',
                  }}
                >
                  Question Prompt Text *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Enter the full question prompt..."
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    backgroundColor: '#161e2e',
                    border: '1px solid #1e293b',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      backgroundColor: '#161e2e',
                      border: '1px solid #1e293b',
                      color: '#ffffff',
                      fontSize: '0.825rem',
                    }}
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="ESSAY">Essay</option>
                    <option value="SPEAKING">Speaking</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Difficulty
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      backgroundColor: '#161e2e',
                      border: '1px solid #1e293b',
                      color: '#ffffff',
                      fontSize: '0.825rem',
                    }}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Topic
                  </label>
                  <input
                    required
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Grammar Syntax"
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      backgroundColor: '#161e2e',
                      border: '1px solid #1e293b',
                      color: '#ffffff',
                      fontSize: '0.825rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                }}
              >
                <Button variant="secondary" type="button" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                >
                  Save Question
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW QUESTION DRAWER/MODAL */}
      {previewQuestion && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
          onClick={() => setPreviewQuestion(null)}
        >
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant="info">{previewQuestion.programmeName || 'IELTS Academic'}</Badge>
                <Badge variant={previewQuestion.category === 'MOCK' ? 'primary' : 'neutral'}>
                  {previewQuestion.category || 'MOCK'}
                </Badge>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <h3
              style={{ margin: '0 0 1rem', fontSize: '1.15rem', color: '#ffffff', lineHeight: 1.4 }}
            >
              {previewQuestion.text}
            </h3>

            <div
              style={{
                padding: '1rem',
                backgroundColor: '#0f172a',
                borderRadius: '10px',
                fontSize: '0.85rem',
                color: '#cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div>
                <strong>Topic:</strong> {previewQuestion.topic}
              </div>
              <div>
                <strong>Learning Objective:</strong> {previewQuestion.learningObjective}
              </div>
              <div>
                <strong>Difficulty:</strong> {previewQuestion.difficulty}
              </div>
              <div>
                <strong>Status:</strong> {previewQuestion.status}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button variant="secondary" onClick={() => setPreviewQuestion(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 110,
            padding: '1.5rem',
          }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 size={36} color="#f87171" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: '#ffffff' }}>
              Confirm Question Deletion
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Are you sure you want to delete this question? This action will remove it permanently
              from the Question Bank.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
              <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDelete(deleteConfirmId)}
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
              >
                Delete Question
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionBankScreen;
