import { PracticeSession, StudentSkillProgress } from '../../services/student/practice.service';

export interface IPracticeRepository {
  getSessions(studentId?: string): Promise<PracticeSession[]>;
  getSessionById(id: string): Promise<PracticeSession | null>;
  saveSession(session: PracticeSession): Promise<PracticeSession>;
  deleteSession(id: string): Promise<boolean>;
  getSkillProgress(studentId?: string): Promise<StudentSkillProgress[]>;
}
