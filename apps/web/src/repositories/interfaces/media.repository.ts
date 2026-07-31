import { MediaAsset, ExamType } from '../../services/admin/questions.service';

export interface IMediaRepository {
  findAll(): Promise<MediaAsset[]>;
  findById(id: string): Promise<MediaAsset | null>;
  findByExam(exam?: ExamType): Promise<MediaAsset[]>;
  save(media: MediaAsset): Promise<MediaAsset>;
  delete(id: string): Promise<boolean>;
}
