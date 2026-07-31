import { ISpeakingTaskRepository, SpeakingTask } from '../interfaces/speaking-task.repository';
import { ExamType } from '../../services/admin/questions.service';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';

const SPEAKING_TASKS_STORAGE_KEY = 'clasptek_speaking_tasks';

function getLocalSpeakingTasks(): SpeakingTask[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(SPEAKING_TASKS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalSpeakingTasks(tasks: SpeakingTask[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SPEAKING_TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }
}

export class SupabaseSpeakingTaskRepository implements ISpeakingTaskRepository {
  private get supabase() {
    return getSupabaseBrowserClient();
  }

  async findAll(): Promise<SpeakingTask[]> {
    try {
      const { data, error } = await this.supabase.from('speaking_tasks').select('*');
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          code: row.code,
          examType: row.exam_type,
          partNumber: row.part_number,
          title: row.title,
          prompt: row.prompt,
          preparationSeconds: row.preparation_seconds,
          responseSeconds: row.response_seconds,
          audioPromptUrl: row.audio_prompt_url,
          createdAt: row.created_at,
        }));
      }
    } catch {
      // fallback
    }
    return getLocalSpeakingTasks();
  }

  async findById(id: string): Promise<SpeakingTask | null> {
    const list = await this.findAll();
    return list.find((t) => t.id === id) || null;
  }

  async findByExam(exam?: ExamType): Promise<SpeakingTask[]> {
    const list = await this.findAll();
    return list.filter((t) => (!exam ? true : t.examType === exam));
  }

  async save(task: SpeakingTask): Promise<SpeakingTask> {
    const localList = getLocalSpeakingTasks();
    const idx = localList.findIndex((t) => t.id === task.id);
    if (idx >= 0) localList[idx] = task;
    else localList.unshift(task);
    saveLocalSpeakingTasks(localList);

    try {
      await this.supabase.from('speaking_tasks').upsert({
        id: task.id,
        code: task.code || `SPK-${task.id}`,
        exam_type: task.examType,
        part_number: task.partNumber,
        title: task.title,
        prompt: task.prompt,
        preparation_seconds: task.preparationSeconds,
        response_seconds: task.responseSeconds,
        audio_prompt_url: task.audioPromptUrl,
      });
    } catch {
      // fallback saved
    }

    return task;
  }

  async delete(id: string): Promise<boolean> {
    const localList = getLocalSpeakingTasks();
    const filtered = localList.filter((t) => t.id !== id);
    saveLocalSpeakingTasks(filtered);

    try {
      await this.supabase.from('speaking_tasks').delete().eq('id', id);
    } catch {
      // fallback saved
    }

    return true;
  }
}
