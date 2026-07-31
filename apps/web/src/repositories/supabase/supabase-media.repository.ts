import { IMediaRepository } from '../interfaces/media.repository';
import { MediaAsset, ExamType } from '../../services/admin/questions.service';

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
  async findAll(): Promise<MediaAsset[]> {
    try {
      const res = await fetch('/api/v1/admin/media', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.error('SupabaseMediaRepository.findAll fallback error:', err);
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
    return media;
  }

  async delete(id: string): Promise<boolean> {
    const localList = getLocalMedia();
    const filtered = localList.filter((m) => m.id !== id);
    saveLocalMedia(filtered);
    return true;
  }
}
