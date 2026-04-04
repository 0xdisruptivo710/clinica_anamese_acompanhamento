import type { IMessageService, SendMessageInput, SendMessageResult } from '@aesthetic-track/application';

export class EvolutionAPIMessageService implements IMessageService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.EVOLUTION_API_URL ?? '';
    this.apiKey = process.env.EVOLUTION_API_KEY ?? '';
  }

  async send(input: SendMessageInput): Promise<SendMessageResult> {
    if (input.channel !== 'whatsapp') {
      return { externalMessageId: '', status: 'failed', error: 'EvolutionAPI only supports WhatsApp' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/message/sendText/AestheticTrack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          number: input.to,
          text: input.body,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        return { externalMessageId: '', status: 'failed', error: errorBody };
      }

      const data = await response.json();
      return {
        externalMessageId: data.key?.id ?? '',
        status: 'sent',
      };
    } catch (error) {
      return {
        externalMessageId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getStatus(externalMessageId: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/chat/findMessages/AestheticTrack?where.key.id=${externalMessageId}`,
        { headers: { apikey: this.apiKey } },
      );
      const data = await response.json();
      return data?.[0]?.status ?? 'unknown';
    } catch {
      return 'unknown';
    }
  }
}
