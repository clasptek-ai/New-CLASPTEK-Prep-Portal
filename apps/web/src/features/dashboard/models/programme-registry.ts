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
    if (raw.includes('ENGLISH') || raw.includes('ENG-PROF') || raw.includes('FOUNDATION')) {
      return PROGRAMME_CONFIGURATIONS.ENGLISH_PROFICIENCY || PROGRAMME_CONFIGURATIONS.IELTS_ACADEMIC;
    }
    if (raw.includes('GENERAL') && raw.includes('IELTS')) {
      return PROGRAMME_CONFIGURATIONS.IELTS_GENERAL;
    }
    if (raw.includes('IELTS')) {
      return PROGRAMME_CONFIGURATIONS.IELTS_ACADEMIC;
    }
    if (raw.includes('TOEFL')) {
      return PROGRAMME_CONFIGURATIONS.TOEFL_IBT || PROGRAMME_CONFIGURATIONS.TOEFL || PROGRAMME_CONFIGURATIONS.IELTS_ACADEMIC;
    }
    if (raw.includes('SAT')) {
      return PROGRAMME_CONFIGURATIONS.DIGITAL_SAT || PROGRAMME_CONFIGURATIONS.SAT || PROGRAMME_CONFIGURATIONS.IELTS_ACADEMIC;
    }
    if (raw.includes('CELPIP')) {
      return PROGRAMME_CONFIGURATIONS.CELPIP_GENERAL || PROGRAMME_CONFIGURATIONS.CELPIP || PROGRAMME_CONFIGURATIONS.IELTS_ACADEMIC;
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
