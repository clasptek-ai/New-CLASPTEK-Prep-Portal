import {
  MockBlueprint,
  MockTemplate,
  MockSession,
  MockResult,
  MockIntegrityLog,
} from '../../features/mock-engine/domain/mock-blueprint';

export interface IMockRepository {
  // Blueprints
  getBlueprints(): Promise<MockBlueprint[]>;
  getBlueprintById(id: string): Promise<MockBlueprint | null>;
  saveBlueprint(blueprint: MockBlueprint): Promise<MockBlueprint>;

  // Templates (Execution Aggregate)
  getTemplates(): Promise<MockTemplate[]>;
  getTemplateById(id: string): Promise<MockTemplate | null>;
  saveTemplate(template: MockTemplate): Promise<MockTemplate>;

  // Sessions (Active Execution)
  getSessions(studentId?: string): Promise<MockSession[]>;
  getSessionById(id: string): Promise<MockSession | null>;
  saveSession(session: MockSession): Promise<MockSession>;

  // Results
  getResults(studentId?: string): Promise<MockResult[]>;
  getResultById(id: string): Promise<MockResult | null>;
  saveResult(result: MockResult): Promise<MockResult>;
}
