import { EvaluationBudget, BudgetRepositoryContract } from '@clasptek/domain-ai-evaluation';

export class PostgresBudgetRepository implements BudgetRepositoryContract {
  private budget: EvaluationBudget | null = null;

  public async saveBudget(budget: EvaluationBudget): Promise<void> {
    this.budget = budget;
  }

  public async findBudget(): Promise<EvaluationBudget | null> {
    return this.budget;
  }
}
