export interface NotificationPayload {
  studentId: string;
  jobId: string;
  resultId?: string | undefined;
  status: string;
  message: string;
}

export interface NotificationStrategy {
  readonly channel: 'IN_APP' | 'EMAIL' | 'WEBHOOK' | 'PUSH';
  send(payload: NotificationPayload): Promise<boolean>;
}

export class InAppNotification implements NotificationStrategy {
  public readonly channel = 'IN_APP';
  public async send(payload: NotificationPayload): Promise<boolean> {
    return !!payload.jobId;
  }
}

export class EmailNotification implements NotificationStrategy {
  public readonly channel = 'EMAIL';
  public async send(payload: NotificationPayload): Promise<boolean> {
    return !!payload.jobId;
  }
}

export class WebhookNotification implements NotificationStrategy {
  public readonly channel = 'WEBHOOK';
  public async send(payload: NotificationPayload): Promise<boolean> {
    return !!payload.jobId;
  }
}

export class PushNotification implements NotificationStrategy {
  public readonly channel = 'PUSH';
  public async send(payload: NotificationPayload): Promise<boolean> {
    return !!payload.jobId;
  }
}

export class NotificationStrategyFactory {
  public static getStrategies(): NotificationStrategy[] {
    return [
      new InAppNotification(),
      new EmailNotification(),
      new WebhookNotification(),
      new PushNotification(),
    ];
  }
}
