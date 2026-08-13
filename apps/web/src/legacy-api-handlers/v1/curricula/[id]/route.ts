export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurriculumContext } from '@/lib/curriculum-context';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { getCurriculumHandler, logger } = await getCurriculumContext();
  try {
    const resolvedParams = await params;
    const curriculumId = resolvedParams.id;
    const cur = await getCurriculumHandler.execute(curriculumId);

    // Hydrate mappings to full details if required
    const versions = await Promise.all(
      cur.versions.map(async (v: any) => {
        const programmeMappings = (v.programmeMappings || []).map((m: any) => {
          return {
            programmeId: m.programmeId,
            programmeVersionId: m.programmeVersionId,
            displayOrder: m.displayOrder,
            courses: [],
          };
        });

        const metadataObj: Record<string, string> = {};
        for (const [key, value] of v.metadata.entries()) {
          metadataObj[key] = value;
        }

        return {
          id: v.id,
          versionNo: v.versionNo.value,
          status: v.status,
          name: v.name,
          description: v.description,
          effectiveFrom: v.effectiveFrom,
          effectiveUntil: v.effectiveUntil,
          breakingChange: v.breakingChange,
          migrationNotes: v.migrationNotes,
          lockVersion: v.lockVersion,
          programmeMappings,
          prerequisites: v.prerequisites,
          metadata: metadataObj,
        };
      })
    );

    return NextResponse.json(
      {
        id: cur.id,
        code: cur.code.value,
        slug: cur.slug,
        name: cur.name,
        description: cur.description,
        status: cur.status,
        lockVersion: cur.lockVersion,
        currentVersionId: cur.currentVersionId,
        currentVersionNo: cur.currentVersionNo,
        versions,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    logger.error(
      'GET /api/v1/curricula/[id] failure',
      err instanceof Error ? err : new Error(String(err))
    );
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'Curriculum not found' },
      { status: 404 }
    );
  }
}
