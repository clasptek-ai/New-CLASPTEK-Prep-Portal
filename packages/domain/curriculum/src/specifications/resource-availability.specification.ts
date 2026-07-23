import { Specification } from '@clasptek/kernel';
import { ResourceReference } from '../entities/resource-reference.entity';

export class ResourceAvailabilitySpecification extends Specification<ResourceReference[]> {
  public isSatisfiedBy(resources: ResourceReference[]): boolean {
    // All referenced resources must be active and available
    return resources.every((r) => r.status === 'active' && r.availabilityStatus === 'available');
  }
}
