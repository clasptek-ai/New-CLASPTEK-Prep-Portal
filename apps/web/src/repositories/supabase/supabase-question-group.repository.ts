import { IQuestionGroupRepository } from '../interfaces/question-group.repository';
import { QuestionGroup } from '../../services/admin/questions.service';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';

const GROUPS_STORAGE_KEY = 'clasptek_question_groups';

function getLocalGroups(): QuestionGroup[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalGroups(groups: QuestionGroup[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  }
}

export class SupabaseQuestionGroupRepository implements IQuestionGroupRepository {
  private get supabase() {
    return getSupabaseBrowserClient();
  }

  async findAll(): Promise<QuestionGroup[]> {
    try {
      const { data, error } = await this.supabase.from('question_groups').select('*');
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          passageId: row.passage_id,
          instructions: row.instructions,
          type: row.question_type || 'MCQ',
          questionIds: row.question_ids || [],
        }));
      }
    } catch {
      // fallback
    }
    return getLocalGroups();
  }

  async findById(id: string): Promise<QuestionGroup | null> {
    const list = await this.findAll();
    return list.find((g) => g.id === id) || null;
  }

  async findByPassageId(passageId: string): Promise<QuestionGroup[]> {
    const list = await this.findAll();
    return list.filter((g) => g.passageId === passageId);
  }

  async save(group: QuestionGroup): Promise<QuestionGroup> {
    const localList = getLocalGroups();
    const idx = localList.findIndex((g) => g.id === group.id);
    if (idx >= 0) localList[idx] = group;
    else localList.unshift(group);
    saveLocalGroups(localList);

    try {
      await this.supabase.from('question_groups').upsert({
        id: group.id,
        code: `GRP-${group.id}`,
        passage_id: group.passageId || null,
        title: group.title,
        instructions: group.instructions,
        question_type: group.type,
      });
    } catch {
      // fallback saved
    }

    return group;
  }

  async delete(id: string): Promise<boolean> {
    const localList = getLocalGroups();
    const filtered = localList.filter((g) => g.id !== id);
    saveLocalGroups(filtered);

    try {
      await this.supabase.from('question_groups').delete().eq('id', id);
    } catch {
      // fallback saved
    }

    return true;
  }
}
