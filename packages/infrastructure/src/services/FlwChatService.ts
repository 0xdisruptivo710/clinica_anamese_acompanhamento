import type { IMessageService, SendMessageInput, SendMessageResult } from '@aesthetic-track/application';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface FlwSendResponse {
  id: string;
  sessionId: string | null;
  senderId: string | null;
  status: 'PROCESSING' | 'SAVED' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'DELETED';
  statusUrl: string | null;
}

export interface FlwContact {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  name: string | null;
  nameWhatsapp: string | null;
  phoneNumber: string | null;
  phoneNumberFormatted: string | null;
  email: string | null;
  instagram: string | null;
  annotation: string | null;
  tagIds: string[] | null;
  tagNames: string[] | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
  origin: string;
  customFields: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

export interface FlwTemplate {
  id: string;
  name: string;
  status: string;
  type: string;
  channelId: string | null;
  body: string | null;
  parameters: string[] | null;
}

export interface FlwChannel {
  id: string;
  key: string;
  platform: string;
  displayName: string;
}

export interface FlwScheduledMessage {
  id: string;
  from: string | null;
  to: string;
  status: 'SCHEDULED' | 'PROCESSED' | 'SENT' | 'DELIVERED' | 'READ' | 'CANCELED' | 'FAILED';
  scheduling: string;
  templateId: string | null;
  type: 'TEMPLATE' | 'CHATBOT';
  createdAt: string;
  updatedAt: string;
}

export interface FlwPaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasMorePages: boolean;
  items: T[];
}

export interface FlwSendMessageOptions {
  to: string;
  from?: string;
  text?: string;
  templateId?: string;
  parameters?: Record<string, string>;
  fileUrl?: string;
  hiddenSession?: boolean;
  botId?: string;
}

export interface FlwCreateScheduledMessageInput {
  to: string;
  from?: string;
  templateId: string;
  templateParams?: Record<string, string>;
  scheduling: string; // ISO date-time
  type?: 'TEMPLATE' | 'CHATBOT';
  hiddenSession?: boolean;
  botId?: string;
}

export interface FlwUpdateContactInput {
  name?: string;
  email?: string;
  phoneNumber?: string;
  instagram?: string;
  annotation?: string;
  tagNames?: string[];
  tagIds?: string[];
  status?: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
  customFields?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  pictureUrl?: string;
}

export interface FlwUpdateTagsInput {
  tagNames?: string[];
  tagIds?: string[];
  operation: 'InsertIfNotExists' | 'DeleteIfExists' | 'ReplaceAll';
}

export interface FlwCreateContactInput {
  name?: string;
  phoneNumber?: string;
  email?: string;
  annotation?: string;
  tagNames?: string[];
  customFields?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// ──────────────────────────────────────────────
// Service
// ──────────────────────────────────────────────

/**
 * Complete FLW Chat / WTS Chat API integration service.
 *
 * Base URLs supported:
 * - https://api.flwchat.com.br (primary)
 * - https://api.wts.chat (alias)
 * - https://api.flw.chat (alias)
 *
 * All chat endpoints use /chat/v1/...
 * All core endpoints use /core/v1/...
 */
export class FlwChatService implements IMessageService {
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(apiToken: string, baseUrl = 'https://api.wts.chat') {
    this.apiToken = apiToken;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiToken}`,
    };
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FLW API ${method} ${path} failed (${response.status}): ${errorText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  // ──────────────────────────────────────────────
  // IMessageService implementation
  // ──────────────────────────────────────────────

  async send(input: SendMessageInput): Promise<SendMessageResult> {
    if (input.channel !== 'whatsapp') {
      return { externalMessageId: '', status: 'failed', error: 'FLW Chat only supports WhatsApp' };
    }

    try {
      const result = await this.sendMessage({
        to: input.to,
        text: input.body,
        hiddenSession: true,
      });
      return {
        externalMessageId: result.id,
        status: result.status === 'FAILED' ? 'failed' : 'sent',
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
      const data = await this.getMessageStatus(externalMessageId);
      return (data as { status?: string })?.status?.toLowerCase() ?? 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // ──────────────────────────────────────────────
  // Messages — POST /chat/v1/message/send
  // ──────────────────────────────────────────────

  async sendMessage(options: FlwSendMessageOptions): Promise<FlwSendResponse> {
    const bodyContent: Record<string, unknown> = {};
    if (options.text) bodyContent.text = options.text;
    if (options.templateId) {
      bodyContent.templateId = options.templateId;
      if (options.parameters) bodyContent.parameters = options.parameters;
    }
    if (options.fileUrl) bodyContent.fileUrl = options.fileUrl;

    const payload: Record<string, unknown> = {
      to: options.to,
      body: bodyContent,
      options: { hiddenSession: options.hiddenSession ?? true },
    };

    if (options.from) payload.from = options.from;
    if (options.botId) payload.botId = options.botId;

    return this.request<FlwSendResponse>('POST', '/chat/v1/message/send', payload);
  }

  /** Synchronous send — waits for delivery confirmation */
  async sendMessageSync(options: FlwSendMessageOptions): Promise<FlwSendResponse> {
    const bodyContent: Record<string, unknown> = {};
    if (options.text) bodyContent.text = options.text;
    if (options.templateId) {
      bodyContent.templateId = options.templateId;
      if (options.parameters) bodyContent.parameters = options.parameters;
    }
    if (options.fileUrl) bodyContent.fileUrl = options.fileUrl;

    const payload: Record<string, unknown> = {
      to: options.to,
      body: bodyContent,
      options: { hiddenSession: options.hiddenSession ?? true },
    };

    if (options.from) payload.from = options.from;
    if (options.botId) payload.botId = options.botId;

    return this.request<FlwSendResponse>('POST', '/chat/v1/message/send-sync', payload);
  }

  /** GET /chat/v1/message/{id}/status */
  async getMessageStatus(messageId: string): Promise<unknown> {
    return this.request('GET', `/chat/v1/message/${messageId}/status`);
  }

  // ──────────────────────────────────────────────
  // Scheduled Messages — /chat/v1/scheduled-message
  // ──────────────────────────────────────────────

  async createScheduledMessage(input: FlwCreateScheduledMessageInput): Promise<FlwScheduledMessage> {
    const payload: Record<string, unknown> = {
      to: input.to,
      type: input.type ?? 'TEMPLATE',
      templateId: input.templateId,
      scheduling: input.scheduling,
      hiddenSession: input.hiddenSession ?? true,
    };

    if (input.from) payload.from = input.from;
    if (input.botId) payload.botId = input.botId;
    if (input.templateParams) payload.templateParams = input.templateParams;

    return this.request<FlwScheduledMessage>('POST', '/chat/v1/scheduled-message', payload);
  }

  async listScheduledMessages(filters?: {
    status?: string;
    to?: string;
    from?: string;
    scheduledAfter?: string;
    scheduledBefore?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<FlwPaginatedResponse<FlwScheduledMessage>> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('Status', filters.status);
    if (filters?.to) params.set('To', filters.to);
    if (filters?.from) params.set('From', filters.from);
    if (filters?.scheduledAfter) params.set('ScheduledAt.After', filters.scheduledAfter);
    if (filters?.scheduledBefore) params.set('ScheduledAt.Before', filters.scheduledBefore);
    params.set('PageNumber', String(filters?.pageNumber ?? 1));
    params.set('PageSize', String(filters?.pageSize ?? 50));

    const qs = params.toString();
    return this.request('GET', `/chat/v1/scheduled-message?${qs}`);
  }

  async updateScheduledMessage(id: string, data: {
    scheduling?: string;
    templateId?: string;
    templateParams?: Record<string, string>;
    to?: string;
    from?: string;
  }): Promise<FlwScheduledMessage> {
    const fields: string[] = [];
    if (data.scheduling) fields.push('Scheduling');
    if (data.templateId) fields.push('TemplateId');
    if (data.to) fields.push('To');
    if (data.from) fields.push('From');

    return this.request<FlwScheduledMessage>('PUT', `/chat/v1/scheduled-message/${id}`, {
      fields,
      ...data,
    });
  }

  async cancelScheduledMessage(id: string): Promise<void> {
    await this.request('POST', `/chat/v1/scheduled-message/${id}/cancel`);
  }

  async cancelScheduledMessagesBatch(ids: string[]): Promise<void> {
    await this.request('POST', '/chat/v1/scheduled-message/batch/cancel', { ids });
  }

  // ──────────────────────────────────────────────
  // Templates — /chat/v1/template
  // ──────────────────────────────────────────────

  async listTemplates(filters?: {
    name?: string;
    channelId?: string;
    approvedOnly?: boolean;
    type?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<FlwPaginatedResponse<FlwTemplate>> {
    const params = new URLSearchParams();
    if (filters?.name) params.set('Name', filters.name);
    if (filters?.channelId) params.set('ChannelId', filters.channelId);
    if (filters?.approvedOnly !== undefined) params.set('ApprovedOnly', String(filters.approvedOnly));
    if (filters?.type) params.set('Type', filters.type);
    params.set('PageNumber', String(filters?.pageNumber ?? 1));
    params.set('PageSize', String(filters?.pageSize ?? 100));

    const qs = params.toString();
    return this.request('GET', `/chat/v1/template?${qs}`);
  }

  // ──────────────────────────────────────────────
  // Channels — /chat/v1/channel
  // ──────────────────────────────────────────────

  async listChannels(channelType?: string): Promise<FlwChannel[]> {
    const params = new URLSearchParams();
    if (channelType) params.set('ChannelType', channelType);
    const qs = params.toString();
    return this.request('GET', `/chat/v1/channel${qs ? `?${qs}` : ''}`);
  }

  // ──────────────────────────────────────────────
  // Contacts — /core/v1/contact
  // ──────────────────────────────────────────────

  async createContact(input: FlwCreateContactInput): Promise<FlwContact> {
    return this.request<FlwContact>('POST', '/core/v1/contact', input);
  }

  async getContactByPhone(phone: string, includeDetails?: string[]): Promise<FlwContact | null> {
    const params = new URLSearchParams();
    if (includeDetails) {
      for (const d of includeDetails) params.append('IncludeDetails', d);
    }
    const qs = params.toString();

    try {
      return await this.request<FlwContact>(
        'GET',
        `/core/v1/contact/phonenumber/${encodeURIComponent(phone)}${qs ? `?${qs}` : ''}`,
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) return null;
      throw error;
    }
  }

  async updateContactByPhone(phone: string, data: FlwUpdateContactInput): Promise<FlwContact> {
    const fields: string[] = [];
    if (data.name !== undefined) fields.push('Name');
    if (data.email !== undefined) fields.push('Email');
    if (data.phoneNumber !== undefined) fields.push('PhoneNumber');
    if (data.instagram !== undefined) fields.push('Instagram');
    if (data.annotation !== undefined) fields.push('Annotation');
    if (data.tagNames !== undefined || data.tagIds !== undefined) fields.push('Tags');
    if (data.status !== undefined) fields.push('Status');
    if (data.customFields !== undefined) fields.push('CustomFields');
    if (data.metadata !== undefined) fields.push('Metadata');
    if (data.pictureUrl !== undefined) fields.push('PictureUrl');

    return this.request<FlwContact>(
      'PUT',
      `/core/v1/contact/phonenumber/${encodeURIComponent(phone)}`,
      { ...data, fields },
    );
  }

  async updateTagsByPhone(phone: string, input: FlwUpdateTagsInput): Promise<FlwContact> {
    return this.request<FlwContact>(
      'POST',
      `/core/v1/contact/phonenumber/${encodeURIComponent(phone)}/tags`,
      input,
    );
  }

  // ──────────────────────────────────────────────
  // CRM Sync helper
  // ──────────────────────────────────────────────

  async syncClientToCRM(client: {
    phone: string;
    fullName: string;
    email?: string;
    skinType?: string;
    fitzpatrick?: string;
    allergies?: string[];
    aestheticGoals?: string;
    tags?: string[];
    procedureCategories?: string[];
  }): Promise<{ contact: FlwContact; tagsUpdated: boolean }> {
    const annotation = this.buildAnnotation(client);

    const contact = await this.updateContactByPhone(client.phone, {
      name: client.fullName,
      email: client.email,
      annotation,
      metadata: {
        source: 'AestheticTrack',
        skinType: client.skinType ?? null,
        fitzpatrick: client.fitzpatrick ?? null,
        aestheticGoals: client.aestheticGoals ?? null,
      },
    });

    const crmTags: string[] = ['AestheticTrack'];
    if (client.skinType) crmTags.push(`pele:${client.skinType}`);
    if (client.tags) crmTags.push(...client.tags);

    if (client.procedureCategories) {
      const procTagMap: Record<string, string> = {
        facial_botox: 'Botox', facial_filler: 'Preenchimento',
        facial_stimulator: 'Bioestimulador', facial_skinbooster: 'Skinbooster',
        facial_ultraformer: 'Ultraformer Facial', facial_laser: 'Laser Facial',
        facial_peel: 'Peeling', facial_led: 'LED',
        facial_microneedling: 'Microagulhamento', body_lipolysis: 'Lipolise',
        body_ultraformer: 'Ultraformer Corporal', body_radiofrequency: 'Radiofrequencia',
        body_cavitation: 'Cavitacao', body_lymphatic_drainage: 'Drenagem Linfatica',
        body_cryolipolysis: 'Criolipolise',
      };
      for (const cat of client.procedureCategories) {
        const tag = procTagMap[cat];
        if (tag) crmTags.push(tag);
      }
    }

    let tagsUpdated = false;
    if (crmTags.length > 0) {
      await this.updateTagsByPhone(client.phone, {
        tagNames: crmTags,
        operation: 'InsertIfNotExists',
      });
      tagsUpdated = true;
    }

    return { contact, tagsUpdated };
  }

  private buildAnnotation(client: {
    skinType?: string;
    fitzpatrick?: string;
    allergies?: string[];
    aestheticGoals?: string;
  }): string {
    const parts: string[] = ['[AestheticTrack - Anamnese]'];
    if (client.skinType) parts.push(`Pele: ${client.skinType}`);
    if (client.fitzpatrick) parts.push(`Fitzpatrick: ${client.fitzpatrick}`);
    if (client.allergies?.length) parts.push(`Alergias: ${client.allergies.join(', ')}`);
    if (client.aestheticGoals) parts.push(`Objetivos: ${client.aestheticGoals}`);
    return parts.join('\n');
  }
}
