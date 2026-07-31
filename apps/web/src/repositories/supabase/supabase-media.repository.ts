import { IMediaRepository } from '../interfaces/media.repository';
import { MediaAsset, ExamType } from '../../services/admin/questions.service';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';

const MEDIA_STORAGE_KEY = 'clasptek_media_assets';

function getLocalMedia(): MediaAsset[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalMedia(media: MediaAsset[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(media));
  }
}

export class SupabaseMediaRepository implements IMediaRepository {
  private get supabase() {
    return getSupabaseBrowserClient();
  }

  async findAll(): Promise<MediaAsset[]> {
    try {
      const { data, error } = await this.supabase.from('media_assets').select('*');
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          type: row.type,
          url: row.url,
          examType: row.exam_type,
          tags: row.tags || [],
          sizeMb: row.size_mb,
          createdAt: row.created_at,
        }));
      }
    } catch {
      // fallback
    }
    return getLocalMedia();
  }

  async findById(id: string): Promise<MediaAsset | null> {
    const list = await this.findAll();
    return list.find((m) => m.id === id) || null;
  }

  async findByExam(exam?: ExamType): Promise<MediaAsset[]> {
    const list = await this.findAll();
    return list.filter((m) => (!exam ? true : m.examType === exam));
  }

  async save(media: MediaAsset): Promise<MediaAsset> {
    const localList = getLocalMedia();
    const idx = localList.findIndex((m) => m.id === media.id);
    if (idx >= 0) {
      localList[idx] = media;
    } else {
      localList.unshift(media);
    }
    saveLocalMedia(localList);

    try {
      await this.supabase.from('media_assets').upsert({
        id: media.id,
        title: media.title,
        type: media.type,
        url: media.url,
        exam_type: media.examType,
        tags: media.tags,
        size_mb: media.sizeMb,
        created_at: media.createdAt,
      });
    } catch {
      // fallback saved
    }

    return media;
  }

  async delete(id: string): Promise<boolean> {
    const localList = getLocalMedia();
    const filtered = localList.filter((m) => m.id !== id);
    saveLocalMedia(filtered);

    try {
      await this.supabase.from('media_assets').delete().eq('id', id);
    } catch {
      // fallback saved
    }

    return true;
  }
}
