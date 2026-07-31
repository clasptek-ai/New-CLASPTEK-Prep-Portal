import { IPassageRepository } from '../interfaces/passage.repository';
import { Passage, ExamType, SectionType } from '../../services/admin/questions.service';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';

const PASSAGE_STORAGE_KEY = 'clasptek_reading_passages';

function getLocalPassages(): Passage[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(PASSAGE_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalPassages(passages: Passage[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PASSAGE_STORAGE_KEY, JSON.stringify(passages));
  }
}

export class SupabasePassageRepository implements IPassageRepository {
  private get supabase() {
    return getSupabaseBrowserClient();
  }

  async findAll(): Promise<Passage[]> {
    try {
      const { data, error } = await this.supabase.from('reading_passages').select('*');
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          content: row.content,
          examType: row.exam_type,
          section: row.section || 'Reading',
          source: row.source,
          wordCount: row.word_count || 0,
          questionIds: row.question_ids || [],
          createdAt: row.created_at,
        }));
      }
    } catch {
      // fallback to localStorage
    }
    return getLocalPassages();
  }

  async findById(id: string): Promise<Passage | null> {
    const list = await this.findAll();
    return list.find((p) => p.id === id) || null;
  }

  async findByExamAndSection(exam?: ExamType, section?: SectionType): Promise<Passage[]> {
    const list = await this.findAll();
    return list.filter((p) => {
      if (exam && p.examType !== exam) return false;
      if (section && p.section !== section) return false;
      return true;
    });
  }

  async save(passage: Passage): Promise<Passage> {
    const localList = getLocalPassages();
    const idx = localList.findIndex((p) => p.id === passage.id);
    if (idx >= 0) {
      localList[idx] = passage;
    } else {
      localList.unshift(passage);
    }
    saveLocalPassages(localList);

    try {
      await this.supabase.from('reading_passages').upsert({
        id: passage.id,
        title: passage.title,
        content: passage.content,
        exam_type: passage.examType,
        section: passage.section,
        source: passage.source,
        word_count: passage.wordCount,
        created_at: passage.createdAt,
      });
    } catch {
      // client fallback saved above
    }

    return passage;
  }

  async delete(id: string): Promise<boolean> {
    const localList = getLocalPassages();
    const filtered = localList.filter((p) => p.id !== id);
    saveLocalPassages(filtered);

    try {
      await this.supabase.from('reading_passages').delete().eq('id', id);
    } catch {
      // fallback saved
    }

    return true;
  }
}
