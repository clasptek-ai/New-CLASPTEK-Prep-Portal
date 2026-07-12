import { DomainEvent } from '@clasptek/events';

/**
 * @domain Identity
 * @projection EventContract
 * Contract for user account creation event
 */
export interface UserAccountRegisteredEvent extends DomainEvent {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserLoginSucceededEvent extends DomainEvent {
  userId: string;
  loginHistoryId: string;
  ipAddress: string;
  userAgent: string;
}
