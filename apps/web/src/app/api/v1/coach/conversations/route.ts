import { NextRequest, NextResponse } from 'next/server';
import { getLearningCoachContext } from '@/lib/learning-coach-context';
import { CoachConversation } from '@clasptek/domain-learning-coach';
import { PostgresConversationRepository, DatabasePool } from '@clasptek/persistence';

/**
 * GET /api/v1/coach/conversations?coachId=...
 * Retrieve conversation history for a coach.
 *
 * POST /api/v1/coach/conversations
 * Start a new conversation or add a message to an active conversation.
 * Body (Start): { coachId, topic, sessionId }
 * Body (Message): { conversationId, role, content, tokenCount }
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId');

    if (!coachId) {
      return NextResponse.json({ error: 'Missing coachId parameter' }, { status: 400 });
    }

    const ctx = await getLearningCoachContext();
    const history = await ctx.getConversationHistory.execute(coachId);

    return NextResponse.json({
      conversations: history.map(c => ({
        id: c.id,
        coachId: c.coachId,
        sessionId: c.sessionId,
        topic: c.topic,
        status: c.status,
        messageCount: c.messageCount,
        totalTokens: c.totalTokens,
        startedAt: c.startedAt
      }))
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getLearningCoachContext();
    const body = await req.json();
    const { coachId, topic, sessionId, conversationId, role, content, tokenCount } = body;

    // Start a new conversation
    if (coachId) {
      const convo = CoachConversation.start(coachId, topic, sessionId);
      // We can use a direct repository save since it's an infrastructural persist task
      // Retrieve the DB pool or repository from context (which has conversationRepo)
      // Since context is wired with repositories, we can access conversationRepo from context!
      // But wait! Is conversationRepo a property of LearningCoachContext?
      // No, LearningCoachContext has handlers. But wait, we can import/instantiate PostgresConversationRepository directly, or retrieve it!
      // To keep it simple and clean, let's use the DB pool from prediction-engine or configuration, or instantiate PostgresConversationRepository.
      // Let's check how getLearningCoachContext is implemented: it creates `new PostgresConversationRepository(dbPool)` and keeps it internal.
      // Wait, we can export/add the repos to LearningCoachContext or instantiate a new repository since we have DatabasePool!
      // Let's instantiate a repository directly using the pool.
      const env = require('@clasptek/configuration').loadEnvironment();
      const logger = new (require('@clasptek/observability').ConsoleLogger)('web-convo');
      const dbPool = new DatabasePool(env, logger);
      await dbPool.connect();
      const repo = new PostgresConversationRepository(dbPool);

      await repo.save(convo, []);
      return NextResponse.json({
        conversationId: convo.id,
        coachId: convo.coachId,
        topic: convo.topic,
        status: convo.status
      }, { status: 201 });
    }

    // Add message to existing conversation
    if (conversationId && role && content) {
      const env = require('@clasptek/configuration').loadEnvironment();
      const logger = new (require('@clasptek/observability').ConsoleLogger)('web-convo');
      const dbPool = new DatabasePool(env, logger);
      await dbPool.connect();
      const repo = new PostgresConversationRepository(dbPool);

      const convo = await repo.findById(conversationId);
      if (!convo) {
        return NextResponse.json({ error: `Conversation ${conversationId} not found` }, { status: 404 });
      }

      const msg = convo.addMessage(role, content, tokenCount);
      await repo.save(convo, [msg]);

      return NextResponse.json({
        messageId: msg.id,
        conversationId: convo.id,
        messageCount: convo.messageCount,
        totalTokens: convo.totalTokens
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Provide coachId (to start convo) or conversationId/role/content (to send message)' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
