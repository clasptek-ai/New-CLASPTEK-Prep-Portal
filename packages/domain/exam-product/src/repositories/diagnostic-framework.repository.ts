import { DiagnosticFramework } from '../aggregates/diagnostic-framework.aggregate';

export interface DiagnosticFrameworkRepository {
  findById(id: string): Promise<DiagnosticFramework | null>;
  findByCode(code: string): Promise<DiagnosticFramework | null>;
  save(framework: DiagnosticFramework): Promise<void>;
  exists(code: string): Promise<boolean>;
}
