'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { PageContainer, PageContent } from '../../../shared/ui/layout/PageContainer';
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
import { QuestionBankHeader } from './components/QuestionBankHeader';
import { QuestionBankFilters } from './components/QuestionBankFilters';
import { QuestionRow } from './components/QuestionRow';
import { UniversalQuestionPreviewModal } from './components/UniversalQuestionPreviewModal';
import { QuestionInventorySummary } from './components/QuestionInventorySummary';
import { InventoryMetrics } from '../../../services/admin/questions.service';
import {
  CheckCircle2,
  BookOpen,
  Volume2,
  Image as ImageIcon,
  AlertCircle,
  Layers,
  ChevronDown,
  Plus,
} from 'lucide-react';

export function QuestionBankScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
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
  const [selectedAssessment, setSelectedAssessment] = useState<string>('ALL');
  const [selectedContentKind, setSelectedContentKind] = useState<string>('ALL');
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('ALL');
  const [selectedDependency, setSelectedDependency] = useState<string>('ALL');

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
  }, [
    selectedStatus,
    selectedExam,
    selectedSection,
    selectedDifficulty,
    selectedAssessment,
    selectedContentKind,
    selectedQuestionType,
    selectedDependency,
  ]);

  async function loadData() {
    setLoading(true);
    try {
      const [qRes, pData, mData, metricData] = await Promise.all([
        adminQuestionsService.getQuestionsWithPagination({
          status: selectedStatus,
          exam: selectedExam,
          section: selectedSection,
          difficulty: selectedDifficulty,
          search: searchQuery,
          assessment: selectedAssessment,
          contentKind: selectedContentKind,
          questionType: selectedQuestionType,
          dependency: selectedDependency,
          pageSize: 10000,
        }),
        adminQuestionsService.getPassages(),
        adminQuestionsService.getMedia(),
        adminQuestionsService.getInventoryMetrics(),
      ]);

      setQuestions(qRes.data || []);
      setTotalQuestionsCount(qRes.total || (qRes.data || []).length);
      setPassages(pData);
      setMediaList(mData);
      if (metricData) {
        setMetrics(metricData);
      } else if (qRes.metrics) {
        setMetrics(qRes.metrics);
      }
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
    const matchesAssessment = selectedAssessment === 'ALL' || q.assessment === selectedAssessment;
    const matchesContentKind =
      selectedContentKind === 'ALL' || q.contentKind === selectedContentKind;
    const matchesQuestionType = selectedQuestionType === 'ALL' || q.type === selectedQuestionType;
    let matchesDependency = true;
    if (selectedDependency !== 'ALL') {
      if (selectedDependency === 'hasAnswer') {
        matchesDependency = !q.answer?.isMissing && Boolean(q.correctAnswer || q.answer?.primary);
      } else if (selectedDependency === 'missingAnswer') {
        matchesDependency = Boolean(
          q.answer?.isMissing || (!q.correctAnswer && !q.answer?.primary)
        );
      } else if (selectedDependency === 'hasPassage') {
        matchesDependency = Boolean(q.passageId || q.passageCode);
      } else if (selectedDependency === 'missingPassage') {
        matchesDependency = q.section === 'Reading' && !q.passageId && !q.passageCode;
      } else if (selectedDependency === 'hasMedia') {
        matchesDependency = Boolean(q.audioUrl || q.imageUrl);
      }
    }
    const matchesSearch =
      !searchQuery.trim() ||
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.tags && q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return (
      matchesStatus &&
      matchesExam &&
      matchesSection &&
      matchesDifficulty &&
      matchesAssessment &&
      matchesContentKind &&
      matchesQuestionType &&
      matchesDependency &&
      matchesSearch
    );
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
    assessment: selectedAssessment,
    contentKind: selectedContentKind,
    questionType: selectedQuestionType,
    dependency: selectedDependency,
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

  return (
    <PageContainer>
      <PageContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            color: 'var(--text-primary)',
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
                backgroundColor: 'var(--success)',
                color: '#ffffff',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 700,
                fontSize: '0.875rem',
                boxShadow: 'var(--shadow-floating)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <CheckCircle2 size={16} />
              {banner}
            </div>
          )}

          {/* Header Bar */}
          <QuestionBankHeader
            totalCount={totalQuestionsCount}
            loading={loading}
            onImport={() => router.push('/admin/question-bank/import')}
            onAddQuestion={() => setCreateModalOpen(true)}
          />

          {/* Repository Mode Selector: Questions | Passages | Media Library */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.5rem',
            }}
          >
            <button
              onClick={() => setActiveTab('QUESTIONS')}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'QUESTIONS' ? 'var(--brand-primary)' : 'transparent',
                color: activeTab === 'QUESTIONS' ? '#ffffff' : 'var(--text-muted)',
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
                backgroundColor: activeTab === 'PASSAGES' ? 'var(--brand-primary)' : 'transparent',
                color: activeTab === 'PASSAGES' ? '#ffffff' : 'var(--text-muted)',
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
                backgroundColor: activeTab === 'MEDIA' ? 'var(--brand-primary)' : 'transparent',
                color: activeTab === 'MEDIA' ? '#ffffff' : 'var(--text-muted)',
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
              {/* Dynamic Database Inventory & Provenance Hierarchy Tree */}
              <QuestionInventorySummary
                metrics={metrics}
                onSelectFilter={(filters) => {
                  if (filters.assessment) setSelectedAssessment(filters.assessment);
                  if (filters.section) setSelectedSection(filters.section as any);
                  if (filters.contentKind) setSelectedContentKind(filters.contentKind);
                  if (filters.dependency) setSelectedDependency(filters.dependency);
                }}
              />

              {/* Filters: Workflow Status Tabs + Search + Dropdowns */}
              <QuestionBankFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedExam={selectedExam}
                onExamChange={setSelectedExam}
                selectedSection={selectedSection}
                onSectionChange={setSelectedSection}
                selectedDifficulty={selectedDifficulty}
                onDifficultyChange={setSelectedDifficulty}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedAssessment={selectedAssessment}
                onAssessmentChange={setSelectedAssessment}
                selectedContentKind={selectedContentKind}
                onContentKindChange={setSelectedContentKind}
                selectedQuestionType={selectedQuestionType}
                onQuestionTypeChange={setSelectedQuestionType}
                selectedDependency={selectedDependency}
                onDependencyChange={setSelectedDependency}
                statusCounts={{
                  ALL: questions.length,
                  DRAFT: counts.DRAFT,
                  UNDER_REVIEW: counts.UNDER_REVIEW,
                  APPROVED: counts.APPROVED,
                  PUBLISHED: counts.PUBLISHED,
                  ARCHIVED: counts.ARCHIVED,
                }}
              />

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
                onBulkAssignUsages={(usages) =>
                  handleExecuteBulkAction('assign_usages', { usages })
                }
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
                  backgroundColor: 'var(--surface-1)',
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
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
                      color: 'var(--text-secondary)',
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
                      backgroundColor: 'var(--surface-2)',
                      color: 'var(--brand-primary)',
                      border: '1px solid var(--border)',
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
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '0.5rem',
                        zIndex: 1000,
                        width: '210px',
                        boxShadow: 'var(--shadow-floating)',
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
                            color: 'var(--text-primary)',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'transparent')
                          }
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
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading Question Bank datasets...
                </div>
              ) : filteredQuestions.length === 0 ? (
                <Card
                  style={{
                    padding: '3rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--surface-0)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <AlertCircle
                    size={36}
                    color="var(--text-muted)"
                    style={{ margin: '0 auto 1rem' }}
                  />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    No questions found
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    No question items match your selected workflow filters.
                  </p>
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredQuestions.map((q) => (
                    <QuestionRow
                      key={q.id}
                      question={q}
                      isSelected={bulkSelection.isSelected(q.id)}
                      onToggleSelect={(id) => bulkSelection.toggleSelectOne(id)}
                      onPreview={(item) => setPreviewQuestion(item)}
                      onDelete={(id) => setDeleteConfirmId(id)}
                      onStatusChange={(id, status) => handleStatusChange(id, status)}
                    />
                  ))}
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
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
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
                      backgroundColor: 'var(--surface-0)',
                      border: '1px solid var(--border)',
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
                      <span
                        style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}
                      >
                        {pas.title}
                      </span>
                      <Badge variant="info">{pas.examType}</Badge>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Source: <strong>{pas.source || 'Standard'}</strong> | Words:{' '}
                      <strong>{pas.wordCount}</strong> | Linked Questions:{' '}
                      <strong style={{ color: 'var(--brand-primary)' }}>
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
                        color: 'var(--text-secondary)',
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
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
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
                      backgroundColor: 'var(--surface-0)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {med.type === 'AUDIO' ? (
                        <Volume2 size={20} color="var(--brand-primary)" />
                      ) : (
                        <ImageIcon size={20} color="var(--success)" />
                      )}
                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {med.title}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Exam: <strong>{med.examType}</strong> | Size: <strong>{med.sizeMb}</strong>
                    </div>

                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        color: 'var(--brand-primary)',
                        backgroundColor: 'var(--surface-1)',
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
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
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
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
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
                      <label
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Target Exam
                      </label>
                      <select
                        value={newExam}
                        onChange={(e) => setNewExam(e.target.value as ExamType)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
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
                      <label
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Section
                      </label>
                      <select
                        value={newSection}
                        onChange={(e) => setNewSection(e.target.value as SectionType)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
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
                      <label
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Question Type
                      </label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as QuestionType)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
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
                      <label
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                        }}
                      >
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
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Difficulty
                      </label>
                      <select
                        value={newDifficulty}
                        onChange={(e) => setNewDifficulty(e.target.value as DifficultyLevel)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
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
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Attach Passage
                      </label>
                      <select
                        value={newSelectedPassageId}
                        onChange={(e) => setNewSelectedPassageId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
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
                    <label
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                      }}
                    >
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
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>

                  {newType === 'MCQ' && (
                    <div
                      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}
                    >
                      <input
                        placeholder="Option A"
                        value={newOptionA}
                        onChange={(e) => setNewOptionA(e.target.value)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <input
                        placeholder="Option B"
                        value={newOptionB}
                        onChange={(e) => setNewOptionB(e.target.value)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <input
                        placeholder="Option C"
                        value={newOptionC}
                        onChange={(e) => setNewOptionC(e.target.value)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <input
                        placeholder="Option D"
                        value={newOptionD}
                        onChange={(e) => setNewOptionD(e.target.value)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                      }}
                    >
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
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                      }}
                    >
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
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
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
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
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
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
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
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                    }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <select
                      value={pasExam}
                      onChange={(e) => setPasExam(e.target.value as ExamType)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
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
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
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
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
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

          {/* MODAL 3: UNIVERSAL QUESTION, ANSWER & PASSAGE INSPECTOR */}
          <UniversalQuestionPreviewModal
            question={previewQuestion}
            onClose={() => setPreviewQuestion(null)}
            onStatusChange={(id, status) => handleStatusChange(id, status)}
          />

          {/* PASSAGE DETAILS MODAL */}
          {previewPassage && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--border)',
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
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--brand-primary)',
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
                        color: 'var(--text-primary)',
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
                    backgroundColor: 'var(--surface-1)',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Section & Module
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginTop: '2px',
                      }}
                    >
                      {previewPassage.section || 'Reading'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Word Count
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--brand-primary)',
                        marginTop: '2px',
                      }}
                    >
                      {previewPassage.wordCount ||
                        previewPassage.content.split(/\s+/).filter(Boolean).length}{' '}
                      Words
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Linked Questions
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--brand-primary)',
                        marginTop: '2px',
                      }}
                    >
                      {
                        questions.filter(
                          (q) =>
                            (q.passageId && q.passageId === previewPassage.id) ||
                            (q.passageCode && q.passageCode === previewPassage.code) ||
                            (previewPassage.questionIds &&
                              previewPassage.questionIds.includes(q.id))
                        ).length
                      }{' '}
                      Questions
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Question Groups
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--success)',
                        marginTop: '2px',
                      }}
                    >
                      {previewPassage.groups?.length || '5'} Groups
                    </div>
                  </div>
                </div>

                {/* Split View: Left Passage, Right Question Groups */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.25rem',
                    minHeight: '400px',
                  }}
                >
                  {/* Passage Content Body */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Full Passage Reading Text:
                    </div>
                    <div
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        color: 'var(--text-primary)',
                        lineHeight: '1.8',
                        fontSize: '0.92rem',
                        maxHeight: '450px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'serif',
                      }}
                    >
                      {previewPassage.content}
                    </div>
                  </div>

                  {/* Hierarchical Question Groups & Nested Questions */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Hierarchical Question Groups & Tasks:
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        maxHeight: '450px',
                        overflowY: 'auto',
                        paddingRight: '4px',
                      }}
                    >
                      {(() => {
                        const linkedQs = questions.filter(
                          (q) =>
                            (q.passageId && q.passageId === previewPassage.id) ||
                            (q.passageCode && q.passageCode === previewPassage.code) ||
                            (previewPassage.questionIds &&
                              previewPassage.questionIds.includes(q.id))
                        );

                        if (linkedQs.length === 0) {
                          return (
                            <div
                              style={{
                                padding: '2rem',
                                backgroundColor: 'var(--surface-1)',
                                borderRadius: '10px',
                                color: 'var(--text-muted)',
                                fontSize: '0.85rem',
                                textAlign: 'center',
                              }}
                            >
                              No questions currently linked to this passage.
                            </div>
                          );
                        }

                        // Group questions by groupCode
                        const groupedMap = new Map<string, typeof linkedQs>();
                        linkedQs.forEach((q) => {
                          const gKey = q.groupTitle || q.groupCode || 'General Questions';
                          if (!groupedMap.has(gKey)) groupedMap.set(gKey, []);
                          groupedMap.get(gKey)!.push(q);
                        });

                        return Array.from(groupedMap.entries()).map(
                          ([groupTitle, gQuestions], gIdx) => {
                            const firstQ = gQuestions[0];
                            return (
                              <div
                                key={gIdx}
                                style={{
                                  backgroundColor: 'var(--surface-1)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '12px',
                                  padding: '1rem',
                                }}
                              >
                                {/* Group Header */}
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.4rem',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: '0.9rem',
                                      fontWeight: 800,
                                      color: 'var(--brand-primary)',
                                    }}
                                  >
                                    {groupTitle}
                                  </span>
                                  <Badge variant="info">{firstQ.type || 'TASK'}</Badge>
                                </div>

                                {firstQ.contentTitle && (
                                  <div
                                    style={{
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      color: 'var(--warning)',
                                      marginBottom: '0.35rem',
                                    }}
                                  >
                                    {firstQ.contentTitle}
                                  </div>
                                )}

                                {firstQ.groupInstructions && (
                                  <div
                                    style={{
                                      fontSize: '0.75rem',
                                      color: 'var(--text-muted)',
                                      fontStyle: 'italic',
                                      marginBottom: '0.75rem',
                                      lineHeight: '1.4',
                                    }}
                                  >
                                    {firstQ.groupInstructions}
                                  </div>
                                )}

                                {/* Nested Questions */}
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                  }}
                                >
                                  {gQuestions.map((q) => (
                                    <div
                                      key={q.id}
                                      style={{
                                        backgroundColor: 'var(--surface-2)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        padding: '0.75rem',
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          marginBottom: '0.3rem',
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: '0.75rem',
                                            fontFamily: 'monospace',
                                            color: 'var(--brand-primary)',
                                            fontWeight: 700,
                                          }}
                                        >
                                          {q.code}
                                        </span>
                                        <span
                                          style={{
                                            fontSize: '0.75rem',
                                            color: '#34d399',
                                            fontWeight: 700,
                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                          }}
                                        >
                                          Key:{' '}
                                          {q.correctAnswer ||
                                            (q.acceptedAnswers
                                              ? q.acceptedAnswers.join(', ')
                                              : 'Verified')}
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          fontSize: '0.85rem',
                                          color: 'var(--text-primary)',
                                          fontWeight: 500,
                                          lineHeight: 1.5,
                                        }}
                                      >
                                        {q.text}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <Button
                    variant="primary"
                    onClick={() => {
                      router.push('/practice');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    Launch Student Practice Test Mode ➔
                  </Button>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBanner(`Editing passage "${previewPassage.title}"`);
                        setPreviewPassage(null);
                      }}
                    >
                      Edit Passage
                    </Button>
                    <Button variant="primary" onClick={() => setPreviewPassage(null)}>
                      Close Inspector
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
}

export default QuestionBankScreen;
