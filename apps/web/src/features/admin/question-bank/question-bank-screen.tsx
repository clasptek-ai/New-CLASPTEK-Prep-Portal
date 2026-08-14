'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import {
  adminQuestionsService,
  AdminQuestion,
  QuestionWorkflowStatus,
  ExamType,
  SectionType,
  QuestionType,
  DifficultyLevel,
  Passage,
  MediaAsset,
  generateQuestionHash,
} from '../../../services/admin/questions.service';
import { useBulkSelection, SmartSelectionType } from './hooks/useBulkSelection';
import { BulkActionToolbar } from './components/BulkActionToolbar';
import { BulkConfirmationModal } from './components/BulkConfirmationModal';
import {
  Plus,
  Upload,
  CheckCircle2,
  Eye,
  Trash2,
  Search,
  BookOpen,
  ShieldCheck,
  Volume2,
  Image as ImageIcon,
  AlertCircle,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';

export function QuestionBankScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  // Bulk Selection Confirmation Modal State
  const [bulkConfirmAction, setBulkConfirmAction] = useState<'DELETE' | 'ARCHIVE' | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'QUESTIONS' | 'PASSAGES' | 'MEDIA'>('QUESTIONS');

  // Question Workflow Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<QuestionWorkflowStatus | 'ALL'>('ALL');
  const [selectedExam, setSelectedExam] = useState<ExamType | 'ALL'>('ALL');
  const [selectedSection, setSelectedSection] = useState<SectionType | 'ALL'>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'ALL'>('ALL');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createPassageModalOpen, setCreatePassageModalOpen] = useState(false);
  const [_createMediaModalOpen, setCreateMediaModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<AdminQuestion | null>(null);
  const [previewPassage, setPreviewPassage] = useState<Passage | null>(null);
  const [_deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Question Form State
  const [newExam, setNewExam] = useState<ExamType>('IELTS Academic');
  const [newSection, setNewSection] = useState<SectionType>('Reading');
  const [newSkill, setNewSkill] = useState('Matching Headings');
  const [newSubSkill, _setNewSubSkill] = useState('');
  const [newType, setNewType] = useState<QuestionType>('MCQ');
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [newEstimatedTime, _setNewEstimatedTime] = useState('2 mins');
  const [newOfficialSource, _setNewOfficialSource] = useState('Cambridge 18 Test 1');
  const [newPrompt, setNewPrompt] = useState('');
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newHints, setNewHints] = useState('');
  const [newSelectedPassageId, setNewSelectedPassageId] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTags, _setNewTags] = useState('IELTS, Reading, Headings');

  // Passage Form State
  const [pasTitle, setPasTitle] = useState('');
  const [pasExam, setPasExam] = useState<ExamType>('IELTS Academic');
  const [pasSection, _setPasSection] = useState<SectionType>('Reading');
  const [pasSource, setPasSource] = useState('Cambridge 18');
  const [pasContent, setPasContent] = useState('');

  // Media Form State
  const [medTitle, setMedTitle] = useState('');
  const [medType, _setMedType] = useState<'IMAGE' | 'AUDIO' | 'PDF'>('AUDIO');
  const [medUrl, setMedUrl] = useState('');
  const [medExam, _setMedExam] = useState<ExamType>('IELTS Academic');
  const [medTags, _setMedTags] = useState('Listening, Audio');

  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedExam, selectedSection, selectedDifficulty]);

  async function loadData() {
    setLoading(true);
    try {
      const qRes = await adminQuestionsService.getQuestionsWithPagination({
        status: selectedStatus,
        exam: selectedExam,
        section: selectedSection,
        difficulty: selectedDifficulty,
        search: searchQuery,
        pageSize: 10000,
      });
      const pData = await adminQuestionsService.getPassages();
      const mData = await adminQuestionsService.getMedia();
      setQuestions(qRes.data || []);
      setTotalQuestionsCount(qRes.total || (qRes.data || []).length);
      setPassages(pData);
      setMediaList(mData);
    } catch (e) {
      console.error('Failed to load question bank datasets', e);
    } finally {
      setLoading(false);
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3500);
  }

  // Question Workflow State Updates
  async function handleStatusChange(id: string, newStatus: QuestionWorkflowStatus) {
    await adminQuestionsService.updateQuestionStatus(id, newStatus);
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q)));
    showBanner(`Question status updated to ${newStatus}!`);
  }

  async function _handleDeleteQuestion(id: string) {
    await adminQuestionsService.deleteQuestion(id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setTotalQuestionsCount((prev) => Math.max(0, prev - 1));
    setDeleteConfirmId(null);
    if (previewQuestion?.id === id) setPreviewQuestion(null);
    showBanner('Question deleted from Question Bank.');
    await loadData();
  }

  // Duplicate Check on Prompt Change
  function checkDuplicatePrompt(text: string, exam: ExamType, type: QuestionType) {
    if (!text.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const hash = generateQuestionHash(text, exam, type);
    const exists = questions.find((q) => q.hash === hash);
    if (exists) {
      setDuplicateWarning(
        `Duplicate Warning: A question with matching prompt already exists (${exists.code} - ${exists.exam}).`
      );
    } else {
      setDuplicateWarning(null);
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newPrompt.trim() || !newCorrectAnswer.trim()) return;

    const options = [newOptionA, newOptionB, newOptionC, newOptionD].filter(Boolean);
    const distractors = options.filter((opt) => opt !== newCorrectAnswer);

    const selectedPassage = passages.find((p) => p.id === newSelectedPassageId);

    const res = await adminQuestionsService.addQuestion({
      exam: newExam,
      section: newSection,
      skill: newSkill,
      subSkill: newSubSkill,
      type: newType,
      difficulty: newDifficulty,
      status: 'DRAFT',
      estimatedTime: newEstimatedTime,
      officialSource: newOfficialSource,
      text: newPrompt,
      options,
      correctAnswer: newCorrectAnswer,
      distractors,
      explanation: newExplanation,
      hints: newHints ? newHints.split(',').map((h) => h.trim()) : [],
      passageId: newSelectedPassageId || undefined,
      passageTitle: selectedPassage?.title || undefined,
      audioUrl: newAudioUrl || undefined,
      imageUrl: newImageUrl || undefined,
      tags: newTags.split(',').map((t: string) => t.trim()),
    });

    if (res.duplicate) {
      setDuplicateWarning('Cannot create: Duplicate question already exists in repository.');
      return;
    }

    setCreateModalOpen(false);
    resetQuestionForm();
    await loadData();
    showBanner(`New question created in DRAFT status!`);
  }

  async function handleCreatePassage(e: React.FormEvent) {
    e.preventDefault();
    if (!pasTitle.trim() || !pasContent.trim()) return;

    await adminQuestionsService.addPassage({
      title: pasTitle,
      examType: pasExam,
      section: pasSection,
      source: pasSource,
      content: pasContent,
    });

    setCreatePassageModalOpen(false);
    setPasTitle('');
    setPasContent('');
    await loadData();
    showBanner('New Passage added to repository!');
  }

  async function _handleCreateMedia(e: React.FormEvent) {
    e.preventDefault();
    if (!medTitle.trim() || !medUrl.trim()) return;

    await adminQuestionsService.addMedia({
      title: medTitle,
      type: medType,
      url: medUrl,
      examType: medExam,
      tags: medTags.split(',').map((t: string) => t.trim()),
    });

    setCreateMediaModalOpen(false);
    setMedTitle('');
    setMedUrl('');
    await loadData();
    showBanner('New Media asset registered in Library!');
  }

  function resetQuestionForm() {
    setNewPrompt('');
    setNewOptionA('');
    setNewOptionB('');
    setNewOptionC('');
    setNewOptionD('');
    setNewCorrectAnswer('');
    setNewExplanation('');
    setNewHints('');
    setNewSelectedPassageId('');
    setNewAudioUrl('');
    setNewImageUrl('');
    setDuplicateWarning(null);
  }

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesStatus = selectedStatus === 'ALL' || q.status === selectedStatus;
    const matchesExam =
      selectedExam === 'ALL' || q.exam === selectedExam || q.programmeName === selectedExam;
    const matchesSection = selectedSection === 'ALL' || q.section === selectedSection;
    const matchesDifficulty = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    const matchesSearch =
      !searchQuery.trim() ||
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.tags && q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesStatus && matchesExam && matchesSection && matchesDifficulty && matchesSearch;
  });

  // Enterprise Bulk Selection Hook & State
  const bulkSelection = useBulkSelection(filteredQuestions);
  const [smartMenuOpen, setSmartMenuOpen] = useState(false);

  const activeFilterParams = {
    searchQuery,
    status: selectedStatus,
    exam: selectedExam,
    section: selectedSection,
    difficulty: selectedDifficulty,
  };

  const handleExecuteBulkAction = async (
    action:
      | 'publish'
      | 'unpublish'
      | 'archive'
      | 'restore'
      | 'delete'
      | 'duplicate'
      | 'assign_usages'
      | 'update_difficulty'
      | 'update_exam'
      | 'update_section'
      | 'move_passage'
      | 'export',
    payloadData?: any
  ) => {
    const res = await adminQuestionsService.bulkAction({
      action,
      questionIds: bulkSelection.selectedIds,
      selectAllFiltered: bulkSelection.selectAllFiltered,
      filter: activeFilterParams,
      payloadData,
    });

    if (res.success) {
      showBanner(res.message);
      bulkSelection.clearSelection();
      setBulkConfirmAction(null);
      await loadData();
    }
  };

  const handleBulkExportCSV = (format: 'CSV' | 'EXCEL' | 'JSON') => {
    const target = bulkSelection.selectAllFiltered
      ? filteredQuestions
      : questions.filter((q) => bulkSelection.isSelected(q.id));

    if (format === 'JSON') {
      const jsonStr = JSON.stringify(target, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clasptek_question_bank_export_${Date.now()}.json`;
      link.click();
    } else {
      const headers = [
        'QuestionID',
        'Exam',
        'Section',
        'Skill',
        'Difficulty',
        'Status',
        'QuestionText',
        'CorrectAnswer',
        'Explanation',
      ].join(',');
      const rows = target
        .map(
          (q) =>
            `"${q.code || q.id}","${q.exam}","${q.section}","${q.skill}","${q.difficulty}","${
              q.status
            }","${q.text.replace(/"/g, '""')}","${q.correctAnswer.replace(/"/g, '""')}","${(
              q.explanation || ''
            ).replace(/"/g, '""')}"`
        )
        .join('\n');

      const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clasptek_question_bank_export_${Date.now()}.csv`;
      link.click();
    }
    showBanner(`Exported ${target.length} question records as ${format}!`);
  };

  // Workflow Status Counts
  const counts = {
    ALL: questions.length,
    DRAFT: questions.filter((q) => q.status === 'DRAFT').length,
    UNDER_REVIEW: questions.filter((q) => q.status === 'UNDER_REVIEW').length,
    APPROVED: questions.filter((q) => q.status === 'APPROVED').length,
    PUBLISHED: questions.filter((q) => q.status === 'PUBLISHED').length,
    ARCHIVED: questions.filter((q) => q.status === 'ARCHIVED').length,
  };

  const getStatusBadgeVariant = (st: QuestionWorkflowStatus) => {
    switch (st) {
      case 'PUBLISHED':
        return 'success';
      case 'APPROVED':
        return 'info';
      case 'UNDER_REVIEW':
        return 'warning';
      case 'DRAFT':
        return 'neutral';
      case 'ARCHIVED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Toast Banner */}
      {banner && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '0.85rem 1.35rem',
            borderRadius: '10px',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={18} />
          {banner}
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.35rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                padding: '0.5rem',
                borderRadius: '8px',
                color: '#3b82f6',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Universal Question Bank
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Curate, review, and publish candidate exam items for IELTS, TOEFL, SAT, CELPIP & English
            Proficiency.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/question-bank/import')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Upload size={16} />
            Bulk Import (CSV/JSON)
          </Button>

          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
            Add New Question
          </Button>
        </div>
      </div>

      {/* Repository Mode Selector: Questions | Passages | Media Library */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '0.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('QUESTIONS')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'QUESTIONS' ? '#2563eb' : 'transparent',
            color: activeTab === 'QUESTIONS' ? '#ffffff' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Layers size={16} />
          Question Repository ({loading ? '...' : totalQuestionsCount})
        </button>

        <button
          onClick={() => setActiveTab('PASSAGES')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'PASSAGES' ? '#2563eb' : 'transparent',
            color: activeTab === 'PASSAGES' ? '#ffffff' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <BookOpen size={16} />
          Passage Manager ({passages.length})
        </button>

        <button
          onClick={() => setActiveTab('MEDIA')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'MEDIA' ? '#2563eb' : 'transparent',
            color: activeTab === 'MEDIA' ? '#ffffff' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Volume2 size={16} />
          Media Library ({mediaList.length})
        </button>
      </div>

      {/* VIEW TAB 1: QUESTION REPOSITORY */}
      {activeTab === 'QUESTIONS' && (
        <>
          {/* Approval Workflow Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
            }}
          >
            {(['ALL', 'DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as const).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: selectedStatus === st ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                    backgroundColor: selectedStatus === st ? 'rgba(59, 130, 246, 0.15)' : '#111827',
                    color: selectedStatus === st ? '#60a5fa' : '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: selectedStatus === st ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{st.replace('_', ' ')}</span>
                  <span
                    style={{
                      padding: '0.1rem 0.45rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      fontSize: '0.7rem',
                    }}
                  >
                    {counts[st]}
                  </span>
                </button>
              )
            )}
          </div>

          {/* Filter Toolbar */}
          <Card
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                flex: 1,
                minWidth: '240px',
              }}
            >
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by text, code (e.g. IELTS-RD-001), skill, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Dropdown Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Exam Filter */}
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value as ExamType | 'ALL')}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Exams</option>
                <option value="IELTS Academic">IELTS Academic</option>
                <option value="IELTS General Training">IELTS General Training</option>
                <option value="TOEFL iBT">TOEFL iBT</option>
                <option value="SAT">SAT</option>
                <option value="CELPIP">CELPIP</option>
                <option value="English Proficiency">English Proficiency</option>
              </select>

              {/* Section Filter */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value as SectionType | 'ALL')}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Sections</option>
                <option value="Reading">Reading</option>
                <option value="Listening">Listening</option>
                <option value="Writing">Writing</option>
                <option value="Speaking">Speaking</option>
                <option value="Math">Math</option>
                <option value="Grammar">Grammar</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'ALL')}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </Card>

          {/* Sticky Bulk Action Toolbar */}
          <BulkActionToolbar
            selectedCount={bulkSelection.selectedCount}
            totalFilteredCount={filteredQuestions.length}
            selectAllFiltered={bulkSelection.selectAllFiltered}
            passages={passages}
            onSelectAllFiltered={() => bulkSelection.selectAllFilteredResults()}
            onClearSelection={() => bulkSelection.clearSelection()}
            onBulkPublish={() => handleExecuteBulkAction('publish')}
            onBulkUnpublish={() => handleExecuteBulkAction('unpublish')}
            onBulkArchive={() => setBulkConfirmAction('ARCHIVE')}
            onBulkDelete={() => setBulkConfirmAction('DELETE')}
            onBulkAssignUsages={(usages) => handleExecuteBulkAction('assign_usages', { usages })}
            onBulkUpdateDifficulty={(difficulty) =>
              handleExecuteBulkAction('update_difficulty', { difficulty })
            }
            onBulkMoveToPassage={(passageId, passageTitle) =>
              handleExecuteBulkAction('move_passage', { passageId, passageTitle })
            }
            onBulkExport={(format) => handleBulkExportCSV(format)}
          />

          {/* Selection Control Bar & Smart Criteria Dropdown */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#111827',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#cbd5e1',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    filteredQuestions.length > 0 &&
                    filteredQuestions.every((q) => bulkSelection.isSelected(q.id))
                  }
                  onChange={() =>
                    bulkSelection.toggleSelectPage(filteredQuestions.map((q) => q.id))
                  }
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Select Current Page ({filteredQuestions.length} Items)</span>
              </label>
            </div>

            {/* Smart Selection Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setSmartMenuOpen(!smartMenuOpen)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.785rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  backgroundColor: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>Smart Select...</span>
                <ChevronDown size={12} />
              </button>

              {smartMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '0.5rem',
                    zIndex: 1000,
                    width: '210px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  {[
                    { key: 'PUBLISHED', label: 'Select Published Items' },
                    { key: 'DRAFT', label: 'Select Draft Items' },
                    { key: 'UNDER_REVIEW', label: 'Select Under Review' },
                    { key: 'MISSING_EXPLANATION', label: 'Select Missing Explanations' },
                    { key: 'HARD_DIFFICULTY', label: 'Select Hard Difficulty' },
                    { key: 'UNASSIGNED_PASSAGE', label: 'Select Unassigned Passage' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        bulkSelection.selectBySmartCriteria(
                          item.key as SmartSelectionType,
                          filteredQuestions
                        );
                        setSmartMenuOpen(false);
                      }}
                      style={{
                        padding: '0.4rem 0.6rem',
                        textAlign: 'left',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#f8fafc',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Question List Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              Loading Question Bank datasets...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <Card style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#111827' }}>
              <AlertCircle size={36} color="#64748b" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                No questions found
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                No question items match your selected workflow filters.
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredQuestions.map((q) => {
                const selected = bulkSelection.isSelected(q.id);
                return (
                  <Card
                    key={q.id}
                    style={{
                      padding: '1.25rem',
                      backgroundColor: selected ? 'rgba(59, 130, 246, 0.08)' : '#111827',
                      border: selected
                        ? '1px solid rgba(59, 130, 246, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {/* Top Line Meta: Checkbox, Code, Exam, Section, Status */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {/* Item Row Selection Checkbox */}
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => bulkSelection.toggleSelectOne(q.id)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#2563eb',
                          }}
                        />
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            backgroundColor: '#1e293b',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            color: '#38bdf8',
                          }}
                        >
                          {q.code || q.id}
                        </span>
                        <Badge variant="info">{q.exam || q.programmeName || 'IELTS'}</Badge>
                        <Badge variant="neutral">{q.section || 'General'}</Badge>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Clock size={12} /> {q.estimatedTime || '2 mins'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge variant={getStatusBadgeVariant(q.status)}>{q.status}</Badge>
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
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: '#f8fafc',
                        lineHeight: 1.5,
                      }}
                    >
                      {q.text}
                    </div>

                    {/* Passage Title if attached */}
                    {q.passageTitle && (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#cbd5e1',
                          backgroundColor: '#161e2e',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <BookOpen size={14} color="#38bdf8" />
                        Attached Passage: <strong>{q.passageTitle}</strong>
                      </div>
                    )}

                    {/* Footer Actions & Metadata */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Skill: <strong>{q.skill || q.topic}</strong> | Source:{' '}
                        <strong>{q.officialSource || 'Clasptek Bank'}</strong>
                      </div>

                      {/* Workflow Transition Buttons */}
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewQuestion(q)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Eye size={14} /> Preview
                        </Button>

                        {q.status === 'DRAFT' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusChange(q.id, 'UNDER_REVIEW')}
                          >
                            Submit for Review
                          </Button>
                        )}

                        {q.status === 'UNDER_REVIEW' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusChange(q.id, 'APPROVED')}
                          >
                            Approve Item
                          </Button>
                        )}

                        {q.status === 'APPROVED' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleStatusChange(q.id, 'PUBLISHED')}
                          >
                            Publish to Mocks
                          </Button>
                        )}

                        {q.status !== 'ARCHIVED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(q.id, 'ARCHIVED')}
                            style={{ color: '#ef4444' }}
                          >
                            Archive
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(q.id)}
                          style={{ color: '#64748b' }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Bulk Confirmation Modal */}
          <BulkConfirmationModal
            isOpen={bulkConfirmAction !== null}
            actionType={bulkConfirmAction}
            count={bulkSelection.selectedCount}
            isAllFiltered={bulkSelection.selectAllFiltered}
            onConfirm={() => {
              if (bulkConfirmAction === 'DELETE') {
                handleExecuteBulkAction('delete');
              } else if (bulkConfirmAction === 'ARCHIVE') {
                handleExecuteBulkAction('archive');
              }
            }}
            onCancel={() => setBulkConfirmAction(null)}
          />
        </>
      )}

      {/* VIEW TAB 2: PASSAGE MANAGER */}
      {activeTab === 'PASSAGES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Passage Repository (1 Passage ➔ Many Questions)
            </h2>
            <Button
              variant="primary"
              onClick={() => setCreatePassageModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> Add New Passage
            </Button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
            }}
          >
            {passages.map((pas) => (
              <Card
                key={pas.id}
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                    {pas.title}
                  </span>
                  <Badge variant="info">{pas.examType}</Badge>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Source: <strong>{pas.source || 'Standard'}</strong> | Words:{' '}
                  <strong>{pas.wordCount}</strong> | Linked Questions:{' '}
                  <strong style={{ color: '#a78bfa' }}>
                    {
                      questions.filter(
                        (q) =>
                          (q.passageId && q.passageId === pas.id) ||
                          (q.passageCode && q.passageCode === pas.code) ||
                          (pas.questionIds && pas.questionIds.includes(q.id))
                      ).length
                    }
                  </strong>
                </div>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#cbd5e1',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {pas.content}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewPassage(pas)}
                  style={{ marginTop: 'auto' }}
                >
                  View Passage Details
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* VIEW TAB 3: MEDIA LIBRARY */}
      {activeTab === 'MEDIA' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Reusable Media Library (Audio & Diagrams)
            </h2>
            <Button
              variant="primary"
              onClick={() => setCreateMediaModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> Register Media Asset
            </Button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {mediaList.map((med) => (
              <Card
                key={med.id}
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {med.type === 'AUDIO' ? (
                    <Volume2 size={20} color="#38bdf8" />
                  ) : (
                    <ImageIcon size={20} color="#10b981" />
                  )}
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                    {med.title}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Exam: <strong>{med.examType}</strong> | Size: <strong>{med.sizeMb}</strong>
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    color: '#60a5fa',
                    backgroundColor: '#161e2e',
                    padding: '0.4rem',
                    borderRadius: '4px',
                    wordBreak: 'break-all',
                  }}
                >
                  {med.url}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE UNIVERSAL QUESTION */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1.25rem',
              }}
            >
              Create Universal Question Item
            </h2>

            {duplicateWarning && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                {duplicateWarning}
              </div>
            )}

            <form
              onSubmit={handleCreateQuestion}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                    Target Exam
                  </label>
                  <select
                    value={newExam}
                    onChange={(e) => setNewExam(e.target.value as ExamType)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                    }}
                  >
                    <option value="IELTS Academic">IELTS Academic</option>
                    <option value="IELTS General Training">IELTS General Training</option>
                    <option value="TOEFL iBT">TOEFL iBT</option>
                    <option value="SAT">SAT</option>
                    <option value="CELPIP">CELPIP</option>
                    <option value="English Proficiency">English Proficiency</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                    Section
                  </label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value as SectionType)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                    }}
                  >
                    <option value="Reading">Reading</option>
                    <option value="Listening">Listening</option>
                    <option value="Writing">Writing</option>
                    <option value="Speaking">Speaking</option>
                    <option value="Math">Math</option>
                    <option value="Grammar">Grammar</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                    Question Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as QuestionType)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                    }}
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="FILL_IN_BLANK">Fill in Blank</option>
                    <option value="ESSAY">Essay Response</option>
                    <option value="SPEAKING">Speaking Prompt</option>
                    <option value="TRUE_FALSE_NOT_GIVEN">True / False / Not Given</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                    Skill
                  </label>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. Matching Headings"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                    Difficulty
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as DifficultyLevel)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                    }}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                    Attach Passage
                  </label>
                  <select
                    value={newSelectedPassageId}
                    onChange={(e) => setNewSelectedPassageId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                    }}
                  >
                    <option value="">None (Independent Question)</option>
                    {passages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                  Question Prompt (Supports Markdown & LaTeX Math formatting like \(x^2 + y^2 =
                  r^2\)) *
                </label>
                <textarea
                  rows={3}
                  value={newPrompt}
                  onChange={(e) => {
                    setNewPrompt(e.target.value);
                    checkDuplicatePrompt(e.target.value, newExam, newType);
                  }}
                  placeholder="Type full question prompt text..."
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              {newType === 'MCQ' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input
                    placeholder="Option A"
                    value={newOptionA}
                    onChange={(e) => setNewOptionA(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                    }}
                  />
                  <input
                    placeholder="Option B"
                    value={newOptionB}
                    onChange={(e) => setNewOptionB(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                    }}
                  />
                  <input
                    placeholder="Option C"
                    value={newOptionC}
                    onChange={(e) => setNewOptionC(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                    }}
                  />
                  <input
                    placeholder="Option D"
                    value={newOptionD}
                    onChange={(e) => setNewOptionD(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                  Correct Answer *
                </label>
                <input
                  type="text"
                  value={newCorrectAnswer}
                  onChange={(e) => setNewCorrectAnswer(e.target.value)}
                  placeholder="Exact correct answer string..."
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                  Detailed Rationale / Explanation
                </label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Explain why the answer is correct..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save as Draft
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE PASSAGE */}
      {createPassageModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: '650px',
              width: '100%',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1rem',
              }}
            >
              Add Passage to Repository
            </h2>
            <form
              onSubmit={handleCreatePassage}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <input
                placeholder="Passage Title"
                value={pasTitle}
                onChange={(e) => setPasTitle(e.target.value)}
                required
                style={{
                  padding: '0.65rem',
                  borderRadius: '6px',
                  backgroundColor: '#1e293b',
                  color: '#fff',
                  border: '1px solid #334155',
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <select
                  value={pasExam}
                  onChange={(e) => setPasExam(e.target.value as ExamType)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                  }}
                >
                  <option value="IELTS Academic">IELTS Academic</option>
                  <option value="TOEFL iBT">TOEFL iBT</option>
                  <option value="SAT">SAT</option>
                  <option value="CELPIP">CELPIP</option>
                </select>

                <input
                  placeholder="Official Source (e.g. Cambridge 18)"
                  value={pasSource}
                  onChange={(e) => setPasSource(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                  }}
                />
              </div>

              <textarea
                rows={6}
                placeholder="Full reading/listening passage content..."
                value={pasContent}
                onChange={(e) => setPasContent(e.target.value)}
                required
                style={{
                  padding: '0.65rem',
                  borderRadius: '6px',
                  backgroundColor: '#1e293b',
                  color: '#fff',
                  border: '1px solid #334155',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="ghost" onClick={() => setCreatePassageModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Passage
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PREVIEW QUESTION DETAILS */}
      {previewQuestion && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: '650px',
              width: '100%',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                {previewQuestion.code}
              </span>
              <Badge variant={getStatusBadgeVariant(previewQuestion.status)}>
                {previewQuestion.status}
              </Badge>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              {previewQuestion.text}
            </h3>

            {previewQuestion.options && previewQuestion.options.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {previewQuestion.options.map((opt, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.6rem 0.85rem',
                      borderRadius: '6px',
                      backgroundColor:
                        opt === previewQuestion.correctAnswer
                          ? 'rgba(16, 185, 129, 0.15)'
                          : '#1e293b',
                      border: '1px solid',
                      borderColor: opt === previewQuestion.correctAnswer ? '#10b981' : '#334155',
                      color: opt === previewQuestion.correctAnswer ? '#34d399' : '#cbd5e1',
                      fontSize: '0.875rem',
                    }}
                  >
                    {opt} {opt === previewQuestion.correctAnswer && '✓ (Correct)'}
                  </div>
                ))}
              </div>
            )}

            {previewQuestion.explanation && (
              <div
                style={{
                  backgroundColor: '#161e2e',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#cbd5e1',
                }}
              >
                <strong>Explanation:</strong> {previewQuestion.explanation}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setPreviewQuestion(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PASSAGE DETAILS MODAL */}
      {previewPassage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Header */}
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Passage Repository Detail
                </span>
                <h2
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '0.25rem 0 0',
                  }}
                >
                  {previewPassage.title}
                </h2>
              </div>
              <Badge variant="primary">{previewPassage.examType}</Badge>
            </div>

            {/* Metadata Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
                backgroundColor: '#1e293b',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #334155',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Section & Module</div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    marginTop: '2px',
                  }}
                >
                  {previewPassage.section || 'Reading'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Word Count</div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    marginTop: '2px',
                  }}
                >
                  {previewPassage.wordCount ||
                    previewPassage.content.split(/\s+/).filter(Boolean).length}{' '}
                  Words
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Linked Questions</div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#a78bfa',
                    marginTop: '2px',
                  }}
                >
                  {
                    questions.filter(
                      (q) =>
                        (q.passageId && q.passageId === previewPassage.id) ||
                        (q.passageCode && q.passageCode === previewPassage.code) ||
                        (previewPassage.questionIds && previewPassage.questionIds.includes(q.id))
                    ).length
                  }{' '}
                  Questions
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Created Date</div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#cbd5e1',
                    marginTop: '2px',
                  }}
                >
                  {previewPassage.createdAt
                    ? new Date(previewPassage.createdAt).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            </div>

            {/* Passage Content Body */}
            <div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                }}
              >
                Full Passage Text:
              </div>
              <div
                style={{
                  backgroundColor: '#020617',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  color: '#e2e8f0',
                  lineHeight: '1.7',
                  fontSize: '0.95rem',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {previewPassage.content}
              </div>
            </div>

            {/* Linked Questions Section */}
            <div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                }}
              >
                Linked Questions & Answer Keys:
              </div>
              {questions.filter(
                (q) =>
                  (q.passageId && q.passageId === previewPassage.id) ||
                  (q.passageCode && q.passageCode === previewPassage.code) ||
                  (previewPassage.questionIds && previewPassage.questionIds.includes(q.id))
              ).length === 0 ? (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                  }}
                >
                  No questions currently linked to this passage.
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxHeight: '250px',
                    overflowY: 'auto',
                  }}
                >
                  {questions
                    .filter(
                      (q) =>
                        (q.passageId && q.passageId === previewPassage.id) ||
                        (q.passageCode && q.passageCode === previewPassage.code) ||
                        (previewPassage.questionIds && previewPassage.questionIds.includes(q.id))
                    )
                    .map((lq) => (
                      <div
                        key={lq.id}
                        style={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          padding: '0.85rem 1rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.35rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontFamily: 'monospace',
                              color: '#38bdf8',
                            }}
                          >
                            {lq.code}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                            Answer Key: {lq.correctAnswer}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                          {lq.text}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '0.5rem',
              }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  setBanner(`Editing passage "${previewPassage.title}"`);
                  setPreviewPassage(null);
                }}
              >
                Edit Passage
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setPassages((prev) => prev.filter((p) => p.id !== previewPassage.id));
                  setBanner(`Passage "${previewPassage.title}" removed.`);
                  setPreviewPassage(null);
                }}
              >
                Delete Passage
              </Button>
              <Button variant="primary" onClick={() => setPreviewPassage(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionBankScreen;
