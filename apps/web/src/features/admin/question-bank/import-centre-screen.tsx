'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../shared/ui/card/Card';
import { Button } from '../../../shared/ui/button/Button';
import { Badge } from '../../../shared/ui/badge/Badge';
import {
  Upload,
  FileSpreadsheet,
  Archive,
  FolderPlus,
  FileText,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  FileCheck,
  BookOpen,
  Code2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { adminQuestionsService } from '../../../services/admin/questions.service';

export function downloadEnterpriseCSVTemplate() {
  const headers = [
    'QuestionID',
    'Exam',
    'AssessmentUsage',
    'Section',
    'Skill',
    'SubSkill',
    'QuestionType',
    'Difficulty',
    'PassageID',
    'QuestionText',
    'OptionA',
    'OptionB',
    'OptionC',
    'OptionD',
    'CorrectAnswer',
    'Explanation',
    'EstimatedTime',
    'AudioURL',
    'ImageURL',
    'Tags',
    'Status',
  ].join(',');

  const sampleRows = [
    'Q1001,IELTS Academic,Diagnostic|Practice,Reading,Matching Headings,Paragraph Synthesis,MCQ,MEDIUM,pas-001,"Select the heading that best summarizes Paragraph A.",Heading I,Heading II,Heading III,Heading IV,Heading I,"Heading I captures the core theme of urbanization.",2 mins,,,IELTS|Reading|Headings,PUBLISHED',
    'Q1002,TOEFL iBT,Practice|Mock,Writing,Integrated Task,Lecture Counter-argument,ESSAY,HARD,pas-002,"Summarize the points made in the lecture regarding cognitive load.",,,,,Detailed essay response.,"Lecturer directly contrasts claims 1 and 2.",15 mins,,,TOEFL|Writing|Integrated,PUBLISHED',
    'Q1003,SAT,Diagnostic|Practice|Mock,Math,Advanced Math,Quadratic Equations,MCQ,HARD,,"If f(x) = x^2 - 6x + 9 and g(x) = x - 3, find x where f(x) = g(x).",x=3 and x=4,x=2 and x=3,x=3 only,x=4 only,x=3 and x=4,"Subtracting (x-3) yields x^2-7x+12=0.",1.5 mins,,,SAT|Math|Algebra,PUBLISHED',
    'Q1004,CELPIP,Practice|Mock,Speaking,Interactive Speaking,Giving Advice,SPEAKING,MEDIUM,,"Give advice to a friend choosing between downtown and suburban housing.",,,,,Spoken audio response.,"Structure with opening advice, 2 supporting points, and closing.",1.5 mins,https://assets.clasptek.com/audio/spk-prompt-1.mp3,,CELPIP|Speaking|Advice,PUBLISHED',
  ].join('\n');

  const blob = new Blob([`${headers}\n${sampleRows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'clasptek_universal_question_import_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadEnterpriseJSONTemplate() {
  const jsonTemplate = {
    schemaVersion: '1.0',
    examType: 'IELTS Academic',
    assessmentUsages: ['DIAGNOSTIC', 'PRACTICE', 'MOCK'],
    metadata: {
      exportedAt: new Date().toISOString(),
      source: 'Clasptek Universal Question Bank Importer',
    },
    passages: [
      {
        passageCode: 'IELTS-READ-P001',
        title: 'The Evolution of Maritime Trade Networks',
        passageType: 'READING',
        content: 'Maritime trade has served as the backbone of international commerce for over two millennia...',
      },
    ],
    questions: [
      {
        questionCode: 'IELTS-GRAM-FND-001',
        section: 'GRAMMAR',
        skill: 'GRAMMAR',
        topic: 'Subject-Verb Agreement',
        difficulty: 'FOUNDATION',
        questionType: 'MULTIPLE_CHOICE',
        questionText: 'Select the sentence with correct subject-verb agreement:',
        options: [
          { code: 'A', text: 'The list of items are on the desk.' },
          { code: 'B', text: 'The list of items is on the desk.' },
          { code: 'C', text: 'The list of items were on the desk.' },
          { code: 'D', text: 'The list of items have been on the desk.' },
        ],
        correctAnswer: 'B',
        explanation: "The singular subject 'list' requires the singular verb 'is'.",
        usages: ['DIAGNOSTIC', 'PRACTICE'],
      },
      {
        questionCode: 'IELTS-GRAM-INT-001',
        section: 'GRAMMAR',
        skill: 'GRAMMAR',
        topic: 'Past Perfect Tense',
        difficulty: 'INTERMEDIATE',
        questionType: 'MULTIPLE_CHOICE',
        questionText: "Choose the correct verb tense: 'By the time we arrived, she _____ her presentation.'",
        options: [
          { code: 'A', text: 'has finished' },
          { code: 'B', text: 'had finished' },
          { code: 'C', text: 'finishes' },
          { code: 'D', text: 'will finish' },
        ],
        correctAnswer: 'B',
        explanation: "Past perfect 'had finished' expresses an action completed prior to another past moment.",
        usages: ['PRACTICE', 'MOCK'],
      },
      {
        questionCode: 'IELTS-READ-001',
        section: 'READING',
        skill: 'READING',
        topic: 'Maritime History',
        difficulty: 'ADVANCED',
        questionType: 'MULTIPLE_CHOICE',
        passageCode: 'IELTS-READ-P001',
        questionText: 'What was the principal driver of early maritime trade expansion?',
        options: [
          { code: 'A', text: 'Development of celestial navigation and standardized trade routes' },
          { code: 'B', text: 'Immediate invention of steam engines' },
          { code: 'C', text: 'Reduction of agricultural subsidies' },
          { code: 'D', text: 'Automated postal services' },
        ],
        correctAnswer: 'A',
        explanation: 'Celestial navigation enabled long-distance open ocean travel.',
        usages: ['DIAGNOSTIC', 'PRACTICE', 'MOCK'],
      },
      {
        questionCode: 'IELTS-WRIT-T1-001',
        section: 'WRITING',
        skill: 'WRITING',
        topic: 'Academic Task 1',
        difficulty: 'INTERMEDIATE',
        questionType: 'ESSAY',
        questionText: 'Summarize the information by selecting and reporting the main features of the chart provided.',
        explanation: 'Describe overall trend, highest/lowest data points, and key comparisons.',
        usages: ['DIAGNOSTIC', 'PRACTICE'],
      },
    ],
  };

  const blob = new Blob([JSON.stringify(jsonTemplate, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'clasptek_universal_question_import_template.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function QuestionBankImportCentreScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFormat, setActiveFormat] = useState<'CSV' | 'EXCEL' | 'JSON' | 'ZIP' | 'FOLDER'>(
    'JSON'
  );
  const [selectedProgramme, setSelectedProgramme] = useState<string>('IELTS Academic');
  const [selectedUsages, setSelectedUsages] = useState<Array<'DIAGNOSTIC' | 'PRACTICE' | 'MOCK'>>([
    'DIAGNOSTIC',
    'PRACTICE',
    'MOCK',
  ]);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedJsonPayload, setParsedJsonPayload] = useState<any>(null);

  const [importResult, setImportResult] = useState<{
    success: boolean;
    batchId?: string;
    fileName: string;
    jsonExamType?: string;
    totalParsed: number;
    validQuestions: number;
    invalidCount: number;
    duplicateCount: number;
    passageCount: number;
    foundationCount: number;
    intermediateCount: number;
    advancedCount: number;
    programmeMismatch: boolean;
    errors: any[];
    warnings: string[];
  } | null>(null);

  const processFile = async (file: File) => {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    setSelectedFile({
      name: file.name,
      size: `${sizeInMb} MB`,
      type: file.type || file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
    });

    setIsSimulating(true);
    setImportResult(null);
    setParsedJsonPayload(null);

    try {
      const text = await file.text();
      let payload: any = null;

      if (file.name.endsWith('.json') || activeFormat === 'JSON') {
        try {
          payload = JSON.parse(text);
          setParsedJsonPayload(payload);
        } catch {
          setIsSimulating(false);
          setImportResult({
            success: false,
            fileName: file.name,
            totalParsed: 0,
            validQuestions: 0,
            invalidCount: 1,
            duplicateCount: 0,
            passageCount: 0,
            foundationCount: 0,
            intermediateCount: 0,
            advancedCount: 0,
            programmeMismatch: false,
            errors: [
              {
                rowNumber: 0,
                itemCode: 'SYNTAX',
                field: 'json',
                error: 'Invalid JSON syntax.',
                recommendation: 'Check JSON formatting for syntax errors.',
              },
            ],
            warnings: [],
          });
          return;
        }
      } else {
        // Fallback for non-JSON CSV/Excel dummy preview
        payload = {
          schemaVersion: '1.0',
          examType: selectedProgramme,
          questions: Array.from({ length: 10 }).map((_, i) => ({
            questionCode: `Q-${i + 1}`,
            examType: selectedProgramme,
            section: 'READING',
            difficulty: i % 3 === 0 ? 'FOUNDATION' : i % 3 === 1 ? 'INTERMEDIATE' : 'ADVANCED',
            questionType: 'MULTIPLE_CHOICE',
            questionText: `Sample imported CSV/Excel item ${i + 1}`,
            options: [
              { code: 'A', text: 'Option A' },
              { code: 'B', text: 'Option B' },
            ],
            correctAnswer: 'A',
          })),
        };
        setParsedJsonPayload(payload);
      }

      // Invoke backend schema validation API
      const res = await fetch('/api/v1/admin/questions/import/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload,
          targetProgramme: selectedProgramme,
        }),
      });

      const data = await res.json();
      setIsSimulating(false);

      if (data.success && data.validation) {
        const val = data.validation;
        const mismatch = Boolean(
          val.errors?.some((e: any) => e.itemCode === 'PROGRAMME_MISMATCH')
        );

        setImportResult({
          success: val.isValid && !mismatch,
          fileName: file.name,
          jsonExamType: payload.examType || selectedProgramme,
          totalParsed: val.totalRecords || 0,
          validQuestions: val.validCount || 0,
          invalidCount: val.invalidCount || 0,
          duplicateCount: val.duplicateCount || 0,
          passageCount: val.passageCount || 0,
          foundationCount: val.foundationCount || 0,
          intermediateCount: val.intermediateCount || 0,
          advancedCount: val.advancedCount || 0,
          programmeMismatch: mismatch,
          errors: val.errors || [],
          warnings: val.warnings || [],
        });
      } else {
        setImportResult({
          success: false,
          fileName: file.name,
          totalParsed: 0,
          validQuestions: 0,
          invalidCount: 1,
          duplicateCount: 0,
          passageCount: 0,
          foundationCount: 0,
          intermediateCount: 0,
          advancedCount: 0,
          programmeMismatch: false,
          errors: [{ rowNumber: 0, itemCode: 'API_ERROR', field: 'validation', error: data.error || 'Validation failed', recommendation: 'Retry validation' }],
          warnings: [],
        });
      }
    } catch (err: any) {
      setIsSimulating(false);
      setImportResult({
        success: false,
        fileName: file.name,
        totalParsed: 0,
        validQuestions: 0,
        invalidCount: 1,
        duplicateCount: 0,
        passageCount: 0,
        foundationCount: 0,
        intermediateCount: 0,
        advancedCount: 0,
        programmeMismatch: false,
        errors: [{ rowNumber: 0, itemCode: 'CLIENT_ERROR', field: 'file', error: err.message || 'Failed to read file', recommendation: 'Select a valid file' }],
        warnings: [],
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getAcceptedExtensions = () => {
    switch (activeFormat) {
      case 'JSON':
        return '.json';
      case 'CSV':
        return '.csv';
      case 'EXCEL':
        return '.xlsx,.xls';
      case 'ZIP':
        return '.zip';
      default:
        return '.json,.csv,.xlsx,.xls,.zip';
    }
  };

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
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={getAcceptedExtensions()}
        style={{ display: 'none' }}
      />

      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button
            variant="secondary"
            onClick={() => router.push('/admin/question-bank')}
            style={{ color: '#94a3b8', gap: '0.4rem', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={16} /> Back to Question Bank
          </Button>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              Universal Import Centre
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Import batch question packages into Universal Question Bank with canonical usages
              (DIAGNOSTIC, PRACTICE, MOCK)
            </p>
          </div>
        </div>

        {/* Template Download Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <Button
            variant="outline"
            onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
            style={{
              borderColor: '#38bdf8',
              color: '#38bdf8',
              gap: '0.5rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Code2 size={16} /> Download Universal Template <ChevronDown size={14} />
          </Button>

          {templateMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                backgroundColor: '#161e2e',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 50,
                minWidth: '220px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => {
                  downloadEnterpriseJSONTemplate();
                  setTemplateMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  color: '#f8fafc',
                  border: 'none',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Code2 size={15} color="#38bdf8" /> Universal Template (JSON)
              </button>
              <button
                onClick={() => {
                  downloadEnterpriseCSVTemplate();
                  setTemplateMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  color: '#f8fafc',
                  border: 'none',
                  fontSize: '0.85rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <FileText size={15} color="#34d399" /> Universal Template (CSV)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Target Programme Selection Controls */}
      <Card
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <BookOpen size={18} color="#38bdf8" />
          Target Programme & Assessment Tagging
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#cbd5e1',
                marginBottom: '0.35rem',
              }}
            >
              Target Prep Programme *
            </label>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                color: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              <option value="General (All Programmes)">General (All Programmes)</option>
              <option value="English Proficiency">English Proficiency</option>
              <option value="IELTS Academic">IELTS Academic</option>
              <option value="IELTS General Training">IELTS General Training</option>
              <option value="TOEFL iBT">TOEFL iBT</option>
              <option value="Digital SAT">Digital SAT</option>
              <option value="CELPIP General">CELPIP General</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#cbd5e1',
                marginBottom: '0.35rem',
              }}
            >
              Question Usage (Multi-Select) *
            </label>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                paddingTop: '0.25rem',
              }}
            >
              {[
                { id: 'DIAGNOSTIC', label: '📝 Diagnostic' },
                { id: 'PRACTICE', label: '⚡ Practice' },
                { id: 'MOCK', label: '🎓 Mock' },
              ].map((u) => {
                const isChecked = selectedUsages.includes(u.id as any);
                return (
                  <label
                    key={u.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: isChecked ? '#38bdf8' : '#94a3b8',
                      backgroundColor: isChecked ? 'rgba(56, 189, 248, 0.12)' : '#0f172a',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isChecked ? '#38bdf8' : '#1e293b',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsages((prev) => [...prev, u.id as any]);
                        } else {
                          setSelectedUsages((prev) => prev.filter((x) => x !== u.id));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    {u.label}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Format Selection Cards (5 Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {[
          {
            id: 'CSV',
            label: 'CSV Import',
            sub: 'Standard .csv batch schema',
            icon: <FileText size={20} color="#38bdf8" />,
          },
          {
            id: 'EXCEL',
            label: 'Excel Import (.xlsx)',
            sub: 'Structured spreadsheet workbook',
            icon: <FileSpreadsheet size={20} color="#34d399" />,
          },
          {
            id: 'JSON',
            label: 'JSON Import (.json)',
            sub: 'Structured packages with passages, questions & metadata',
            icon: <Code2 size={20} color="#38bdf8" />,
          },
          {
            id: 'ZIP',
            label: 'ZIP Archive',
            sub: 'Questions with audio & image assets',
            icon: <Archive size={20} color="#a78bfa" />,
          },
          {
            id: 'FOLDER',
            label: 'Folder Import',
            sub: 'Directory tree question packages',
            icon: <FolderPlus size={20} color="#fbbf24" />,
          },
        ].map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => setActiveFormat(fmt.id as any)}
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              backgroundColor: activeFormat === fmt.id ? 'rgba(56, 189, 248, 0.12)' : '#151d30',
              border:
                activeFormat === fmt.id
                  ? '1px solid #38bdf8'
                  : '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {fmt.icon}
              {activeFormat === fmt.id && <Badge variant="info">SELECTED</Badge>}
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                {fmt.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {fmt.sub}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Upload Zone Container */}
      <Card
        style={{
          padding: '2rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
          Batch File Upload & Schema Validation ({activeFormat}) — [{selectedProgramme} / Usages:{' '}
          {selectedUsages.join(', ')}]
        </div>

        {/* Drag & Drop File Zone */}
        <div
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            padding: '3.5rem 2rem',
            borderRadius: '14px',
            backgroundColor: isDragging ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
            border: isDragging ? '2px dashed #38bdf8' : '2px dashed rgba(56, 189, 248, 0.4)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
            }}
          >
            <Upload size={36} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              JSON Question Package Upload
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Accepted: <strong style={{ color: '#38bdf8' }}>{getAcceptedExtensions()}</strong> |
              Target Exam: <strong style={{ color: '#ffffff' }}>{selectedProgramme}</strong>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput();
            }}
            disabled={isSimulating}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              gap: '0.5rem',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FileText size={16} />
            <span>{isSimulating ? 'Validating Batch Schema...' : 'Browse PC & Select File'}</span>
          </Button>
        </div>

        {/* Display Currently Selected File Metadata */}
        {selectedFile && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileCheck size={22} color="#34d399" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Size: {selectedFile.size} | Programme: {selectedProgramme} | Usages:{' '}
                  {selectedUsages.join(', ')}
                </div>
              </div>
            </div>
            <Badge variant="success">FILE LOADED</Badge>
          </div>
        )}

        {/* Validation & Preview Output */}
        {importResult && (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '14px',
              backgroundColor: '#0f172a',
              border: importResult.programmeMismatch
                ? '1px solid #f59e0b'
                : importResult.success
                ? '1px solid rgba(52, 211, 153, 0.4)'
                : '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Validation Banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {importResult.programmeMismatch ? (
                  <AlertTriangle size={22} color="#f59e0b" />
                ) : importResult.success ? (
                  <CheckCircle2 size={22} color="#34d399" />
                ) : (
                  <AlertTriangle size={22} color="#ef4444" />
                )}
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                  Validation Results for {importResult.fileName}
                </span>
              </div>
              <Badge variant={importResult.programmeMismatch ? 'warning' : importResult.success ? 'success' : 'danger'}>
                {importResult.programmeMismatch ? 'PROGRAMME_MISMATCH' : importResult.success ? 'VALIDATED' : 'ERRORS DETECTED'}
              </Badge>
            </div>

            {/* Programme Mismatch Alert */}
            {importResult.programmeMismatch && (
              <div
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>
                    PROGRAMME_MISMATCH WARNING
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                    Selected UI Programme: <strong style={{ color: '#fff' }}>{selectedProgramme}</strong> |
                    JSON Exam Type: <strong style={{ color: '#f59e0b' }}>{importResult.jsonExamType}</strong>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (importResult.jsonExamType) {
                      setSelectedProgramme(importResult.jsonExamType);
                      processFile(new File([JSON.stringify(parsedJsonPayload)], importResult.fileName, { type: 'application/json' }));
                    }
                  }}
                  style={{ backgroundColor: '#f59e0b', color: '#000', fontWeight: 700, fontSize: '0.8rem' }}
                >
                  Align UI to {importResult.jsonExamType}
                </Button>
              </div>
            )}

            {/* Granular Summary Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Parsed</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                  {importResult.totalParsed}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Valid Questions</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                  {importResult.validQuestions}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>Errors / Failed</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: importResult.invalidCount > 0 ? '#ef4444' : '#94a3b8' }}>
                  {importResult.invalidCount}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Passages</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                  {importResult.passageCount}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#a78bfa' }}>Foundation</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a78bfa' }}>
                  {importResult.foundationCount}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Intermediate</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>
                  {importResult.intermediateCount}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#f43f5e' }}>Advanced</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f43f5e' }}>
                  {importResult.advancedCount}
                </div>
              </div>
            </div>

            {/* Error Detail Table */}
            {importResult.errors.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>
                  Validation Errors & Remediation Guidance ({importResult.errors.length}):
                </div>
                <div style={{ overflowX: 'auto', maxHeight: '200px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#161e2e', color: '#cbd5e1', borderBottom: '1px solid #1e293b' }}>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Row #</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Code</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Field</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Error Message</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.errors.map((err, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f87171' }}>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{err.rowNumber || '-'}</td>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>{err.itemCode}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{err.field}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{err.error}</td>
                          <td style={{ padding: '0.5rem 0.75rem', color: '#94a3b8' }}>{err.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Commit & Rollback Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                onClick={async () => {
                  if (!parsedJsonPayload) return;
                  try {
                    setIsSimulating(true);
                    const commitRes = await fetch('/api/v1/admin/questions/import/commit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        payload: parsedJsonPayload,
                        uploadedBy: 'admin-001',
                      }),
                    });

                    const commitData = await commitRes.json();
                    setIsSimulating(false);

                    if (commitData.success) {
                      alert(
                        `Successfully committed ${commitData.importedCount || importResult.validQuestions} questions into Universal Question Bank!`
                      );
                      router.push('/admin/question-bank');
                    } else {
                      alert(`Import commit error: ${commitData.error}`);
                    }
                  } catch (err: any) {
                    setIsSimulating(false);
                    alert(`Import commit failure: ${err.message}`);
                  }
                }}
                disabled={importResult.validQuestions === 0 || isSimulating}
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  gap: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <CheckCircle2 size={16} /> Import Valid Questions ({importResult.validQuestions}) to Question Bank
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  setImportResult(null);
                  setSelectedFile(null);
                  setParsedJsonPayload(null);
                }}
                style={{
                  color: '#f87171',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  gap: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RotateCcw size={16} /> Rollback & Discard Batch
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default QuestionBankImportCentreScreen;
