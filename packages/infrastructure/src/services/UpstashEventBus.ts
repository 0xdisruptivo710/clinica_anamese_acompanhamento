import type { IEventBus } from '@aesthetic-track/application';

interface DomainEvent {
  eventName: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
}

type EventHandler = (event: DomainEvent) => Promise<void>;

export class UpstashEventBus implements IEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const eventHandlers = this.handlers.get(event.eventName) ?? [];
      await Promise.allSettled(eventHandlers.map((handler) => handler(event)));

      if (process.env.QSTASH_URL && process.env.QSTASH_TOKEN) {
        await this.publishToQStash(event);
      }
    }
  }

  subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler);
    this.handlers.set(eventName, existing);
  }

  private async publishToQStash(event: DomainEvent): Promise<void> {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
      await fetch(`${process.env.QSTASH_URL}/v2/publish/${appUrl}/api/webhooks/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
        },
        body: JSON.stringify(event),
      });
    } catch {
      console.error(`Failed to publish event ${event.eventName} to QStash`);
    }
  }
}
