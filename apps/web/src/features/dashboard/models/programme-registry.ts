import { ProgrammeId, ProgrammeConfiguration, PROGRAMME_CONFIGURATIONS } from './programme-config';

export class ProgrammeRegistry {
  private static configurations: Map<ProgrammeId, ProgrammeConfiguration> = new Map(
    Object.entries(PROGRAMME_CONFIGURATIONS) as [ProgrammeId, ProgrammeConfiguration][]
  );

  /**
   * Get configuration by ProgrammeId
   */
  public static get(id: ProgrammeId): ProgrammeConfiguration {
    const config = this.configurations.get(id);
    if (!config) {
      return PROGRAMME_CONFIGURATIONS.IELTS_ACADEMIC;
    }
    return config;
  }

  /**
   * List all registered active programmes
   */
  public static getAll(): ProgrammeConfiguration[] {
    return Array.from(this.configurations.values());
  }

  /**
   * List all valid Programme IDs
   */
  public static getSupportedIds(): ProgrammeId[] {
    return Array.from(this.configurations.keys());
  }

  /**
   * Dynamically register or extend a new programme (e.g. future extensions)
   */
  public static register(config: ProgrammeConfiguration): void {
    this.configurations.set(config.id, config);
  }
}
