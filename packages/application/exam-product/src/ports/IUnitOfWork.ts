export interface IUnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  registerOutbox(event: { eventType: string; aggregateType: string; aggregateId: string; payload: any }): void;
}
