import { IExamPlugin } from '../interfaces/exam-plugin.interface';
import { ExamType } from '../../../services/admin/questions.service';
import { IeltsExamPlugin } from '../implementations/ielts.plugin';
import { ToeflExamPlugin } from '../implementations/toefl.plugin';
import { SatExamPlugin } from '../implementations/sat.plugin';
import { CelpipExamPlugin } from '../implementations/celpip.plugin';

export class ExamPluginRegistry {
  private static plugins: Map<ExamType, IExamPlugin> = new Map();

  static {
    this.registerPlugin(new IeltsExamPlugin());
    this.registerPlugin(new ToeflExamPlugin());
    this.registerPlugin(new SatExamPlugin());
    this.registerPlugin(new CelpipExamPlugin());
  }

  public static registerPlugin(plugin: IExamPlugin) {
    this.plugins.set(plugin.examType, plugin);
  }

  public static getPlugin(examType: ExamType): IExamPlugin {
    const plugin = this.plugins.get(examType);
    if (!plugin) {
      // Default to IELTS plugin if not specifically matched
      return this.plugins.get('IELTS Academic')!;
    }
    return plugin;
  }
}
