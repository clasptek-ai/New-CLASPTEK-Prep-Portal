import { ApplicationError } from '@clasptek/kernel';

export class DomainError extends ApplicationError {
  constructor(
    message: string,
    public readonly code: string = 'LEARNING_RESOURCES_DOMAIN_ERROR'
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
