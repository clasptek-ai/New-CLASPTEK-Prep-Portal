import { IPassageRepository } from '../interfaces/passage.repository';
import { Passage, ExamType, SectionType } from '../../services/admin/questions.service';

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
  async findAll(): Promise<Passage[]> {
    try {
      const res = await fetch('/api/v1/admin/passages', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.error('SupabasePassageRepository.findAll fallback error:', err);
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
    return passage;
  }

  async delete(id: string): Promise<boolean> {
    const localList = getLocalPassages();
    const filtered = localList.filter((p) => p.id !== id);
    saveLocalPassages(filtered);
    return true;
  }
}
