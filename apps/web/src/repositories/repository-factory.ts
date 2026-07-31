import { IQuestionRepository } from './interfaces/question.repository';
import { IPassageRepository } from './interfaces/passage.repository';
import { IMediaRepository } from './interfaces/media.repository';
import { IMockRepository } from './interfaces/mock.repository';
import { IPracticeRepository } from './interfaces/practice.repository';
import { IQuestionGroupRepository } from './interfaces/question-group.repository';
import { IListeningRepository } from './interfaces/listening.repository';
import { IWritingTaskRepository } from './interfaces/writing-task.repository';
import { ISpeakingTaskRepository } from './interfaces/speaking-task.repository';

import { SupabaseQuestionRepository } from './supabase/supabase-question.repository';
import { SupabasePassageRepository } from './supabase/supabase-passage.repository';
import { SupabaseMediaRepository } from './supabase/supabase-media.repository';
import { SupabaseMockRepository } from './supabase/supabase-mock.repository';
import { SupabasePracticeRepository } from './supabase/supabase-practice.repository';
import { SupabaseQuestionGroupRepository } from './supabase/supabase-question-group.repository';
import { SupabaseListeningRepository } from './supabase/supabase-listening.repository';
import { SupabaseWritingTaskRepository } from './supabase/supabase-writing-task.repository';
import { SupabaseSpeakingTaskRepository } from './supabase/supabase-speaking-task.repository';

export type StorageDriver = 'SUPABASE' | 'MEMORY';

export class RepositoryFactory {
  private static driver: StorageDriver = 'SUPABASE';
  private static questionRepo: IQuestionRepository | null = null;
  private static passageRepo: IPassageRepository | null = null;
  private static mediaRepo: IMediaRepository | null = null;
  private static mockRepo: IMockRepository | null = null;
  private static practiceRepo: IPracticeRepository | null = null;
  private static groupRepo: IQuestionGroupRepository | null = null;
  private static listeningRepo: IListeningRepository | null = null;
  private static writingTaskRepo: IWritingTaskRepository | null = null;
  private static speakingTaskRepo: ISpeakingTaskRepository | null = null;

  public static setDriver(driver: StorageDriver) {
    this.driver = driver;
    // reset instances on driver change
    this.questionRepo = null;
    this.passageRepo = null;
    this.mediaRepo = null;
    this.mockRepo = null;
    this.practiceRepo = null;
    this.groupRepo = null;
    this.listeningRepo = null;
    this.writingTaskRepo = null;
    this.speakingTaskRepo = null;
  }

  public static getQuestionRepository(): IQuestionRepository {
    if (!this.questionRepo) {
      this.questionRepo = new SupabaseQuestionRepository();
    }
    return this.questionRepo;
  }

  public static getPassageRepository(): IPassageRepository {
    if (!this.passageRepo) {
      this.passageRepo = new SupabasePassageRepository();
    }
    return this.passageRepo;
  }

  public static getMediaRepository(): IMediaRepository {
    if (!this.mediaRepo) {
      this.mediaRepo = new SupabaseMediaRepository();
    }
    return this.mediaRepo;
  }

  public static getMockRepository(): IMockRepository {
    if (!this.mockRepo) {
      this.mockRepo = new SupabaseMockRepository();
    }
    return this.mockRepo;
  }

  public static getPracticeRepository(): IPracticeRepository {
    if (!this.practiceRepo) {
      this.practiceRepo = new SupabasePracticeRepository();
    }
    return this.practiceRepo;
  }

  public static getQuestionGroupRepository(): IQuestionGroupRepository {
    if (!this.groupRepo) {
      this.groupRepo = new SupabaseQuestionGroupRepository();
    }
    return this.groupRepo;
  }

  public static getListeningRepository(): IListeningRepository {
    if (!this.listeningRepo) {
      this.listeningRepo = new SupabaseListeningRepository();
    }
    return this.listeningRepo;
  }

  public static getWritingTaskRepository(): IWritingTaskRepository {
    if (!this.writingTaskRepo) {
      this.writingTaskRepo = new SupabaseWritingTaskRepository();
    }
    return this.writingTaskRepo;
  }

  public static getSpeakingTaskRepository(): ISpeakingTaskRepository {
    if (!this.speakingTaskRepo) {
      this.speakingTaskRepo = new SupabaseSpeakingTaskRepository();
    }
    return this.speakingTaskRepo;
  }
}
