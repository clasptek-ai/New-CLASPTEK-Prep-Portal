import { ProgrammeId, ProgrammeConfiguration, PROGRAMME_CONFIGURATIONS } from './programme-config';

export class ProgrammeRegistry {
  private static configurations: Map<ProgrammeId, ProgrammeConfiguration> = new Map(
    Object.entries(PROGRAMME_CONFIGURATIONS) as [ProgrammeId, ProgrammeConfiguration][]
  );

  /**
   * Get configuration by ProgrammeId or raw string
   */
  public static get(id: string): ProgrammeConfiguration {
    const raw = (id || '').toUpperCase().trim();
    const configs = PROGRAMME_CONFIGURATIONS as Record<string, ProgrammeConfiguration>;
    if (raw.includes('ENGLISH') || raw.includes('ENG-PROF') || raw.includes('FOUNDATION')) {
      return configs.ENGLISH_PROFICIENCY || configs.IELTS_ACADEMIC;
    }
    if (raw.includes('GENERAL') && raw.includes('IELTS')) {
      return configs.IELTS_GENERAL;
    }
    if (raw.includes('IELTS')) {
      return configs.IELTS_ACADEMIC;
    }
    if (raw.includes('TOEFL')) {
      return configs.TOEFL_IBT || configs.TOEFL || configs.IELTS_ACADEMIC;
    }
    if (raw.includes('SAT')) {
      return configs.DIGITAL_SAT || configs.SAT || configs.IELTS_ACADEMIC;
    }
    if (raw.includes('CELPIP')) {
      return configs.CELPIP_GENERAL || configs.CELPIP || configs.IELTS_ACADEMIC;
    }

    const config = this.configurations.get(id as ProgrammeId);
    return config || PROGRAMME_CONFIGURATIONS.IELTS_ACADEMIC;
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
