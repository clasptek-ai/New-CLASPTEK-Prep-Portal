import { ReadinessFramework } from '../aggregates/readiness-framework.aggregate';

export interface ReadinessFrameworkRepository {
  findById(id: string): Promise<ReadinessFramework | null>;
  findByCode(code: string): Promise<ReadinessFramework | null>;
  save(framework: ReadinessFramework): Promise<void>;
  exists(code: string): Promise<boolean>;
}
