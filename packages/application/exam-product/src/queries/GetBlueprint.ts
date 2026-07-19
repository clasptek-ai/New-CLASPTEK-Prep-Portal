import { Result } from '@clasptek/kernel';
import { BlueprintReadModel } from '../read-models/BlueprintReadModel';

export interface BlueprintReadService {
  getBlueprint(blueprintId: string): Promise<BlueprintReadModel[]>;
}

export class GetBlueprintHandler {
  constructor(private readonly readService: BlueprintReadService) {}

  public async execute(blueprintId: string): Promise<Result<BlueprintReadModel[], Error>> {
    try {
      const results = await this.readService.getBlueprint(blueprintId);
      return Result.success(results);
    } catch (err: any) {
      return Result.failure(err);
    }
  }
}
