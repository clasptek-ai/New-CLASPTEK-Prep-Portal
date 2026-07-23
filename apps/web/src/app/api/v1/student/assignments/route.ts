import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      id: 'as1',
      title: 'Advanced Essay Syntax Assignment',
      description: 'Draft a 500-word argumentative essay focusing on modifiers structure.',
      instructions: 'Submit as PDF or DOCX before due date.',
      dueDate: '2026-07-24',
      maxScore: 100,
      submissionType: 'FILE',
      status: 'GRADED',
      submittedAt: '2026-07-16T15:30:00Z',
      fileUrl: 'https://supabase.co/storage/v1/object/public/submissions/alex_essay.pdf',
      grade: 85,
      instructorFeedback:
        'Well structured modifier syntax. Ensure paragraph transitions are explicit.',
      aiEvaluation: {
        grammarScore: 82,
        coherenceScore: 85,
        lexicalScore: 88,
        overallFeedback:
          'Grammar active modifier modifiers structure is strong. Lexical variety is within band 7.5.',
      },
    },
    {
      id: 'as2',
      title: 'Relative Clauses Grammar Quiz',
      description: 'Fill in lexical review templates online.',
      instructions: 'Complete input fields online.',
      dueDate: '2026-08-01',
      maxScore: 50,
      submissionType: 'TEXT',
      status: 'PENDING',
    },
  ]);
}
