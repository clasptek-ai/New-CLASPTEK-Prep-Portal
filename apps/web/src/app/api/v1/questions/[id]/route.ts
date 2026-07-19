import { NextRequest, NextResponse } from 'next/server';
import { getQuestionBankContext } from '@/lib/question-bank-context';

export async function GET(
  req: NextRequest,
  _params: { params: Promise<{ id: string }> }
) {
  const { getQuestionHandler } = await getQuestionBankContext();
  const { id } = await _params.params;

  const question = await getQuestionHandler.execute(id);
  if (!question) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Question not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: question.id,
    code: question.code.value,
    examProductId: question.examProductId,
    curriculumModuleId: question.curriculumModuleId,
    status: question.status,
    versions: question.versions.map(v => ({
      id: v.id,
      versionNo: v.versionNo.value,
      status: v.status,
      title: v.title,
      payload: v.payload,
      digitalSignature: v.digitalSignature,
      answerOptions: v.answerOptions.map(opt => ({
        id: opt.id,
        code: opt.code,
        textContent: opt.textContent,
        isCorrect: opt.isCorrect,
        displayOrder: opt.displayOrder
      })),
      mediaAssets: v.mediaAssets.map(med => ({
        id: med.id,
        provider: med.provider,
        bucket: med.bucket,
        objectKey: med.objectKey,
        checksum: med.checksum,
        mimeType: med.mimeType,
        fileSize: med.fileSize,
        durationSeconds: med.durationSeconds,
        transcript: med.transcript,
        caption: med.caption,
        thumbnailKey: med.thumbnailKey,
        altText: med.altText
      })),
      solution: v.solution ? {
        id: v.solution.id,
        explanation: v.solution.explanation,
        incorrectExplanation: v.solution.incorrectExplanation,
        hint: v.solution.hint,
        referenceUrl: v.solution.referenceUrl,
        teachingNote: v.solution.teachingNote
      } : null,
      rubric: v.rubric ? {
        id: v.rubric.id,
        criteria: v.rubric.criteria,
        maxPoints: v.rubric.maxPoints,
        description: v.rubric.description
      } : null
    })),
    statistics: question.statistics ? {
      id: question.statistics.id,
      timesUsed: question.statistics.timesUsed,
      timesAnswered: question.statistics.timesAnswered,
      correctRate: question.statistics.correctRate,
      facilityIndex: question.statistics.facilityIndex,
      discriminationIndex: question.statistics.discriminationIndex,
      guessProbability: question.statistics.guessProbability,
      averageDurationMs: question.statistics.averageDurationMs,
      medianDurationMs: question.statistics.medianDurationMs,
      skipRate: question.statistics.skipRate,
      lastUsed: question.statistics.lastUsed
    } : null,
    ownership: question.ownership ? {
      copyrightHolder: question.ownership.copyrightHolder,
      license: question.ownership.license,
      source: question.ownership.source,
      reusePolicy: question.ownership.reusePolicy,
      expirationDate: question.ownership.expirationDate
    } : null,
    dependencies: question.dependencies.map(d => ({
      parentQuestionId: d.parentQuestionId,
      childQuestionId: d.childQuestionId,
      dependencyType: d.dependencyType
    }))
  });
}
