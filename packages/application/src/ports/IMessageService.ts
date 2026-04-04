export interface SendMessageInput {
  to: string;
  channel: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  body: string;
  mediaUrl?: string;
}

export interface SendMessageResult {
  externalMessageId: string;
  status: 'sent' | 'failed';
  error?: string;
}

export interface IMessageService {
  send(input: SendMessageInput): Promise<SendMessageResult>;
  getStatus(externalMessageId: string): Promise<string>;
}
