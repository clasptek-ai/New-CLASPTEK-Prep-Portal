import { IWritingTaskRepository, WritingTask } from '../interfaces/writing-task.repository';
import { ExamType } from '../../services/admin/questions.service';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';

const WRITING_TASKS_STORAGE_KEY = 'clasptek_writing_tasks';

function getLocalWritingTasks(): WritingTask[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(WRITING_TASKS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalWritingTasks(tasks: WritingTask[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WRITING_TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }
}

export class SupabaseWritingTaskRepository implements IWritingTaskRepository {
  private get supabase() {
    return getSupabaseBrowserClient();
  }

  async findAll(): Promise<WritingTask[]> {
    try {
      const { data, error } = await this.supabase.from('writing_tasks').select('*');
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          code: row.code,
          examType: row.exam_type,
          taskNumber: row.task_number,
          title: row.title,
          prompt: row.prompt,
          instructions: row.instructions,
          minWords: row.min_words,
          maxWords: row.max_words,
          timeRecommendedMinutes: row.time_recommended_minutes,
          modelAnswer: row.model_answer,
          createdAt: row.created_at,
        }));
      }
    } catch {
      // fallback
    }
    return getLocalWritingTasks();
  }

  async findById(id: string): Promise<WritingTask | null> {
    const list = await this.findAll();
    return list.find((t) => t.id === id) || null;
  }

  async findByExam(exam?: ExamType): Promise<WritingTask[]> {
    const list = await this.findAll();
    return list.filter((t) => (!exam ? true : t.examType === exam));
  }

  async save(task: WritingTask): Promise<WritingTask> {
    const localList = getLocalWritingTasks();
    const idx = localList.findIndex((t) => t.id === task.id);
    if (idx >= 0) localList[idx] = task;
    else localList.unshift(task);
    saveLocalWritingTasks(localList);

    try {
      await this.supabase.from('writing_tasks').upsert({
        id: task.id,
        code: task.code || `WRT-${task.id}`,
        exam_type: task.examType,
        task_number: task.taskNumber,
        title: task.title,
        prompt: task.prompt,
        instructions: task.instructions,
        min_words: task.minWords,
        max_words: task.maxWords,
        time_recommended_minutes: task.timeRecommendedMinutes,
        model_answer: task.modelAnswer,
      });
    } catch {
      // fallback saved
    }

    return task;
  }

  async delete(id: string): Promise<boolean> {
    const localList = getLocalWritingTasks();
    const filtered = localList.filter((t) => t.id !== id);
    saveLocalWritingTasks(filtered);

    try {
      await this.supabase.from('writing_tasks').delete().eq('id', id);
    } catch {
      // fallback saved
    }

    return true;
  }
}
