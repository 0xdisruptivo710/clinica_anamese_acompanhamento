import type { IMessageService, SendMessageInput, SendMessageResult } from '@aesthetic-track/application';

/** Response from POST /chat/v1/message/send */
interface AiosSendResponse {
  id: string;
  sessionId: string | null;
  senderId: string | null;
  status: 'PROCESSING' | 'SAVED' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'DELETED';
  statusUrl: string | null;
}

/** Response from GET /core/v1/contact/phonenumber/{phone} */
export interface AiosContact {
  id: string;
  name: string | null;
  phoneNumber: string | null;
  phoneNumberFormatted: string | null;
  email: string | null;
  annotation: string | null;
  tagNames: string[] | null;
  tagIds: string[] | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
  customFields: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

export interface AiosSendMessageOptions {
  to: string;
  text?: string;
  templateId?: string;
  parameters?: Record<string, string>;
  from?: string;
  hiddenSession?: boolean;
}

export interface AiosUpdateContactInput {
  name?: string;
  email?: string;
  annotation?: string;
  tagNames?: string[];
  customFields?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AiosUpdateTagsInput {
  tagNames: string[];
  operation: 'InsertIfNotExists' | 'DeleteIfExists' | 'ReplaceAll';
}

/**
 * Service for WTS Chat (Aios) API integration.
 *
 * Endpoints used:
 * - POST https://api.wts.chat/chat/v1/message/send
 * - GET  https://api.wts.chat/core/v1/contact/phonenumber/{phone}
 * - PUT  https://api.wts.chat/core/v1/contact/phonenumber/{phone}
 * - POST https://api.wts.chat/core/v1/contact/phonenumber/{phone}/tags
 * - GET  https://api.wts.chat/chat/v1/message/{id}/status
 */
export class AiosMessageService implements IMessageService {
  private readonly apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiToken}`,
    };
  }

  // ──────────────────────────────────────────────
  // IMessageService implementation
  // ──────────────────────────────────────────────

  async send(input: SendMessageInput): Promise<SendMessageResult> {
    if (input.channel !== 'whatsapp') {
      return { externalMessageId: '', status: 'failed', error: 'Aios only supports WhatsApp' };
    }

    try {
      const result = await this.sendWhatsApp({
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
      const response = await fetch(
        `https://api.wts.chat/chat/v1/message/${externalMessageId}/status`,
        { headers: this.headers() },
      );
      if (!response.ok) return 'unknown';
      const data = await response.json();
      return data?.status?.toLowerCase() ?? 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // ──────────────────────────────────────────────
  // Message sending
  // ──────────────────────────────────────────────

  async sendWhatsApp(options: AiosSendMessageOptions): Promise<AiosSendResponse> {
    const body: Record<string, unknown> = {
      to: options.to,
      body: {} as Record<string, unknown>,
      options: { hiddenSession: options.hiddenSession ?? true },
    };

    if (options.from) (body as Record<string, unknown>).from = options.from;

    const bodyContent = body.body as Record<string, unknown>;
    if (options.templateId) {
      bodyContent.templateId = options.templateId;
      if (options.parameters) bodyContent.parameters = options.parameters;
    } else if (options.text) {
      bodyContent.text = options.text;
    }

    const response = await fetch('https://api.wts.chat/chat/v1/message/send', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Aios send failed (${response.status}): ${err}`);
    }

    return response.json() as Promise<AiosSendResponse>;
  }

  // ──────────────────────────────────────────────
  // Contact management
  // ──────────────────────────────────────────────

  async getContactByPhone(phone: string): Promise<AiosContact | null> {
    const response = await fetch(
      `https://api.wts.chat/core/v1/contact/phonenumber/${encodeURIComponent(phone)}?IncludeDetails=Tags&IncludeDetails=CustomFields`,
      { headers: this.headers() },
    );

    if (response.status === 404) return null;
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Aios getContact failed (${response.status}): ${err}`);
    }

    return response.json() as Promise<AiosContact>;
  }

  async updateContactByPhone(phone: string, data: AiosUpdateContactInput): Promise<AiosContact> {
    const fields: string[] = [];
    if (data.name !== undefined) fields.push('Name');
    if (data.email !== undefined) fields.push('Email');
    if (data.annotation !== undefined) fields.push('Annotation');
    if (data.tagNames !== undefined) fields.push('Tags');
    if (data.customFields !== undefined) fields.push('CustomFields');
    if (data.metadata !== undefined) fields.push('Metadata');

    const response = await fetch(
      `https://api.wts.chat/core/v1/contact/phonenumber/${encodeURIComponent(phone)}`,
      {
        method: 'PUT',
        headers: this.headers(),
        body: JSON.stringify({ ...data, fields }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Aios updateContact failed (${response.status}): ${err}`);
    }

    return response.json() as Promise<AiosContact>;
  }

  async updateTagsByPhone(phone: string, input: AiosUpdateTagsInput): Promise<AiosContact> {
    const response = await fetch(
      `https://api.wts.chat/core/v1/contact/phonenumber/${encodeURIComponent(phone)}/tags`,
      {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(input),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Aios updateTags failed (${response.status}): ${err}`);
    }

    return response.json() as Promise<AiosContact>;
  }

  // ──────────────────────────────────────────────
  // CRM Sync helpers
  // ──────────────────────────────────────────────

  /**
   * Syncs client data from AestheticTrack to Aios CRM.
   * Creates/updates the contact and sets procedure-based tags.
   */
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
  }): Promise<{ contact: AiosContact; tagsUpdated: boolean }> {
    // Update contact basic info + annotation with anamnesis
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

    // Build tags from procedures + client tags
    const crmTags: string[] = ['AestheticTrack'];

    if (client.skinType) crmTags.push(`pele:${client.skinType}`);
    if (client.tags) crmTags.push(...client.tags);

    if (client.procedureCategories) {
      const procTagMap: Record<string, string> = {
        facial_botox: 'Botox',
        facial_filler: 'Preenchimento',
        facial_stimulator: 'Bioestimulador',
        facial_skinbooster: 'Skinbooster',
        facial_ultraformer: 'Ultraformer Facial',
        facial_laser: 'Laser Facial',
        facial_peel: 'Peeling',
        facial_led: 'LED',
        facial_microneedling: 'Microagulhamento',
        body_lipolysis: 'Lipolise',
        body_ultraformer: 'Ultraformer Corporal',
        body_radiofrequency: 'Radiofrequencia',
        body_cavitation: 'Cavitacao',
        body_lymphatic_drainage: 'Drenagem Linfatica',
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
