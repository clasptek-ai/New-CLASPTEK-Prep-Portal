import { ExamType } from '../../services/admin/questions.service';

export interface ListeningSection {
  id: string;
  trackId: string;
  sectionNumber: number;
  title: string;
  startSeconds: number;
  endSeconds: number;
  instructions?: string;
}

export interface ListeningTrack {
  id: string;
  code: string;
  title: string;
  url: string;
  durationSeconds: number;
  transcript?: string;
  examType: ExamType;
  sections?: ListeningSection[];
  createdAt: string;
}

export interface IListeningRepository {
  findAll(): Promise<ListeningTrack[]>;
  findById(id: string): Promise<ListeningTrack | null>;
  findByExam(exam?: ExamType): Promise<ListeningTrack[]>;
  saveTrack(track: ListeningTrack): Promise<ListeningTrack>;
  deleteTrack(id: string): Promise<boolean>;
  getSectionsForTrack(trackId: string): Promise<ListeningSection[]>;
  saveSection(section: ListeningSection): Promise<ListeningSection>;
}
