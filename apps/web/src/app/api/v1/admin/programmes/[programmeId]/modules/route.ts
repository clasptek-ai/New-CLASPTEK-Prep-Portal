export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';

const FALLBACK_MODULES: Record<string, any[]> = {
  p1: [
    {
      id: 'm1',
      name: 'Advanced Writing Skills',
      order: 1,
      lessons: [
        { id: 'l1', title: 'Passive Voice Syntax Constraints', order: 1, status: 'PUBLISHED' },
        { id: 'l2', title: 'Relative Clauses Modifiers Coherence', order: 2, status: 'DRAFT' },
      ],
    },
    {
      id: 'm2',
      name: 'Academic Reading Diagnostics',
      order: 2,
      lessons: [],
    },
  ],
  p2: [
    {
      id: 'm3',
      name: 'Integrated Speaking Tasks',
      order: 1,
      lessons: [
        { id: 'l3', title: 'Pronunciation & Intonation Drills', order: 1, status: 'PUBLISHED' },
      ],
    },
  ],
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ programmeId: string }> }
) {
  try {
    const { programmeId } = await context.params;

    if (!programmeId || typeof programmeId !== 'string' || !programmeId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Programme ID parameter is required.',
          error: 'INVALID_PARAMETER',
        },
        { status: 400 }
      );
    }

    const cleanId = programmeId.trim();

    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('AdminProgrammeModulesRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();

    const pool = dbPool.getPool();

    // Query database for modules belonging to programme
    const modulesRes = await pool
      .query(
        `
      SELECT m.id, m.title as name, m.display_order as "order"
      FROM learning_modules m
      WHERE m.curriculum_id = $1 AND m.deleted_at IS NULL
      ORDER BY m.display_order ASC
      `,
        [cleanId]
      )
      .catch(() => null);

    if (modulesRes && modulesRes.rows && modulesRes.rows.length > 0) {
      const modules = await Promise.all(
        modulesRes.rows.map(async (mod: any) => {
          const lessonsRes = await pool
            .query(
              `
            SELECT id, title, display_order as "order", status
            FROM lessons
            WHERE module_id = $1 AND deleted_at IS NULL
            ORDER BY display_order ASC
            `,
              [mod.id]
            )
            .catch(() => ({ rows: [] }));

          return {
            id: mod.id,
            name: mod.name,
            order: mod.order || 1,
            lessons: lessonsRes.rows || [],
          };
        })
      );
      return NextResponse.json({ success: true, data: modules }, { status: 200 });
    }

    // Check fallback for predefined IDs (p1, p2)
    if (FALLBACK_MODULES[cleanId]) {
      return NextResponse.json({ success: true, data: FALLBACK_MODULES[cleanId] }, { status: 200 });
    }

    // Check if programme exists in curricula table
    const progRes = await pool
      .query('SELECT id FROM curricula WHERE id = $1 AND deleted_at IS NULL', [cleanId])
      .catch(() => null);

    if (progRes && progRes.rows && progRes.rows.length > 0) {
      // Programme exists but has no modules
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // Programme truly does not exist
    return NextResponse.json(
      {
        success: false,
        message: `Programme '${cleanId}' was not found.`,
        error: 'NOT_FOUND',
      },
      { status: 404 }
    );
  } catch (err: unknown) {
    console.error('[GET_PROGRAMME_MODULES_ERROR]', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while fetching programme modules.',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
