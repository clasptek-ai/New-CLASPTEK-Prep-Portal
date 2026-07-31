import { IListeningRepository, ListeningTrack, ListeningSection } from '../interfaces/listening.repository';
import { ExamType } from '../../services/admin/questions.service';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';

const TRACKS_STORAGE_KEY = 'clasptek_listening_tracks';

function getLocalTracks(): ListeningTrack[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(TRACKS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalTracks(tracks: ListeningTrack[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TRACKS_STORAGE_KEY, JSON.stringify(tracks));
  }
}

export class SupabaseListeningRepository implements IListeningRepository {
  private get supabase() {
    return getSupabaseBrowserClient();
  }

  async findAll(): Promise<ListeningTrack[]> {
    try {
      const { data, error } = await this.supabase.from('listening_tracks').select('*');
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          code: row.code,
          title: row.title,
          url: row.url,
          durationSeconds: row.duration_seconds || 0,
          transcript: row.transcript,
          examType: row.exam_type || 'IELTS Academic',
          createdAt: row.created_at,
        }));
      }
    } catch {
      // fallback
    }
    return getLocalTracks();
  }

  async findById(id: string): Promise<ListeningTrack | null> {
    const list = await this.findAll();
    return list.find((t) => t.id === id) || null;
  }

  async findByExam(exam?: ExamType): Promise<ListeningTrack[]> {
    const list = await this.findAll();
    return list.filter((t) => (!exam ? true : t.examType === exam));
  }

  async saveTrack(track: ListeningTrack): Promise<ListeningTrack> {
    const localList = getLocalTracks();
    const idx = localList.findIndex((t) => t.id === track.id);
    if (idx >= 0) localList[idx] = track;
    else localList.unshift(track);
    saveLocalTracks(localList);

    try {
      await this.supabase.from('listening_tracks').upsert({
        id: track.id,
        code: track.code || `TRK-${track.id}`,
        title: track.title,
        url: track.url,
        duration_seconds: track.durationSeconds,
        transcript: track.transcript,
        exam_type: track.examType,
      });
    } catch {
      // fallback saved
    }

    return track;
  }

  async deleteTrack(id: string): Promise<boolean> {
    const localList = getLocalTracks();
    const filtered = localList.filter((t) => t.id !== id);
    saveLocalTracks(filtered);

    try {
      await this.supabase.from('listening_tracks').delete().eq('id', id);
    } catch {
      // fallback saved
    }

    return true;
  }

  async getSectionsForTrack(trackId: string): Promise<ListeningSection[]> {
    try {
      const { data, error } = await this.supabase
        .from('listening_sections')
        .select('*')
        .eq('track_id', trackId)
        .order('section_number', { ascending: true });

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          trackId: row.track_id,
          sectionNumber: row.section_number,
          title: row.title,
          startSeconds: row.start_seconds,
          endSeconds: row.end_seconds,
          instructions: row.instructions,
        }));
      }
    } catch {
      // fallback
    }

    const track = (await this.findAll()).find((t) => t.id === trackId);
    return track?.sections || [];
  }

  async saveSection(section: ListeningSection): Promise<ListeningSection> {
    try {
      await this.supabase.from('listening_sections').upsert({
        id: section.id,
        track_id: section.trackId,
        section_number: section.sectionNumber,
        title: section.title,
        start_seconds: section.startSeconds,
        end_seconds: section.endSeconds,
        instructions: section.instructions,
      });
    } catch {
      // fallback
    }
    return section;
  }
}
