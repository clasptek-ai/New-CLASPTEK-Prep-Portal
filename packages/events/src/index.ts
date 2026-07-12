/**
 * @service EventBus
 * Abstractions for synchronous and asynchronous events
 */

export interface DomainEvent {
  eventId: string;
  occurredAt: Date;
}

export interface EventEnvelope<TPayload = unknown> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  correlationId: string;
  payload: TPayload;
}

export interface EventBus {
  publish(envelopes: EventEnvelope[]): Promise<void>;
  subscribe(eventType: string, handler: (envelope: EventEnvelope) => Promise<void>): void;
}
