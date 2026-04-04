import type { IMessageService, SendMessageInput, SendMessageResult } from '@aesthetic-track/application';

export class ResendEmailService implements IMessageService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY ?? '';
  }

  async send(input: SendMessageInput): Promise<SendMessageResult> {
    if (input.channel !== 'email') {
      return { externalMessageId: '', status: 'failed', error: 'ResendEmail only supports email' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: 'AestheticTrack <noreply@aesthetictrack.com.br>',
          to: [input.to],
          subject: input.subject ?? 'AestheticTrack',
          html: input.body,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        return { externalMessageId: '', status: 'failed', error: errorBody };
      }

      const data = await response.json();
      return { externalMessageId: data.id ?? '', status: 'sent' };
    } catch (error) {
      return {
        externalMessageId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getStatus(_externalMessageId: string): Promise<string> {
    return 'sent';
  }
}
