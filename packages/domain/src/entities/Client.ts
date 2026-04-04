import { Entity } from './Entity';
import { ClientId } from '../value-objects/ClientId';
import { DomainError } from '../errors/DomainError';
import { ValidationError } from '../errors/ValidationError';

export type SkinType = 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive';
export type FitzpatrickScale = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export type MessageChannel = 'whatsapp' | 'email' | 'sms';

export interface ClientProps {
  id: ClientId;
  clinicId: string;
  fullName: string;
  dateOfBirth?: Date;
  cpf?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: Record<string, unknown>;
  skinType?: SkinType;
  fitzpatrick?: FitzpatrickScale;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  previousProcedures: string[];
  aestheticGoals?: string;
  preferredChannel: MessageChannel;
  communicationOptIn: boolean;
  profilePhotoUrl?: string;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Client extends Entity<ClientId> {
  private props: ClientProps;

  private constructor(props: ClientProps) {
    super(props.id);
    this.props = props;
  }

  static create(props: Omit<ClientProps, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): Client {
    if (!props.fullName || props.fullName.trim() === '') {
      throw new ValidationError('Client name is required', 'fullName');
    }
    if (!props.phone || props.phone.trim() === '') {
      throw new ValidationError('Client phone is required', 'phone');
    }

    const client = new Client({
      ...props,
      id: ClientId.generate(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    client._domainEvents.push({
      eventName: 'ClientCreated',
      occurredAt: new Date(),
      payload: {
        clientId: client.props.id.value,
        clinicId: client.props.clinicId,
        fullName: client.props.fullName,
      },
    });

    return client;
  }

  static reconstitute(props: ClientProps): Client {
    return new Client(props);
  }

  deactivate(): void {
    if (!this.props.isActive) throw new DomainError('Client is already inactive');
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    if (this.props.isActive) throw new DomainError('Client is already active');
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  updateAestheticGoals(goals: string): void {
    if (!goals?.trim()) throw new ValidationError('Aesthetic goals cannot be empty');
    this.props.aestheticGoals = goals;
    this.props.updatedAt = new Date();
  }

  updateContactInfo(data: { phone?: string; whatsapp?: string; email?: string }): void {
    if (data.phone) this.props.phone = data.phone;
    if (data.whatsapp !== undefined) this.props.whatsapp = data.whatsapp;
    if (data.email !== undefined) this.props.email = data.email;
    this.props.updatedAt = new Date();
  }

  updateAnamnesis(data: {
    skinType?: SkinType;
    fitzpatrick?: FitzpatrickScale;
    allergies?: string[];
    medications?: string[];
    medicalConditions?: string[];
  }): void {
    if (data.skinType) this.props.skinType = data.skinType;
    if (data.fitzpatrick) this.props.fitzpatrick = data.fitzpatrick;
    if (data.allergies) this.props.allergies = data.allergies;
    if (data.medications) this.props.medications = data.medications;
    if (data.medicalConditions) this.props.medicalConditions = data.medicalConditions;
    this.props.updatedAt = new Date();
  }

  setCommunicationPreferences(channel: MessageChannel, optIn: boolean): void {
    this.props.preferredChannel = channel;
    this.props.communicationOptIn = optIn;
    this.props.updatedAt = new Date();
  }

  addTag(tag: string): void {
    if (!this.props.tags.includes(tag)) {
      this.props.tags.push(tag);
      this.props.updatedAt = new Date();
    }
  }

  removeTag(tag: string): void {
    this.props.tags = this.props.tags.filter((t) => t !== tag);
    this.props.updatedAt = new Date();
  }

  get clinicId(): string { return this.props.clinicId; }
  get fullName(): string { return this.props.fullName; }
  get dateOfBirth(): Date | undefined { return this.props.dateOfBirth; }
  get cpf(): string | undefined { return this.props.cpf; }
  get phone(): string { return this.props.phone; }
  get whatsapp(): string | undefined { return this.props.whatsapp; }
  get email(): string | undefined { return this.props.email; }
  get address(): Record<string, unknown> | undefined { return this.props.address; }
  get skinType(): SkinType | undefined { return this.props.skinType; }
  get fitzpatrick(): FitzpatrickScale | undefined { return this.props.fitzpatrick; }
  get allergies(): string[] { return [...this.props.allergies]; }
  get medications(): string[] { return [...this.props.medications]; }
  get medicalConditions(): string[] { return [...this.props.medicalConditions]; }
  get previousProcedures(): string[] { return [...this.props.previousProcedures]; }
  get aestheticGoals(): string | undefined { return this.props.aestheticGoals; }
  get preferredChannel(): MessageChannel { return this.props.preferredChannel; }
  get communicationOptIn(): boolean { return this.props.communicationOptIn; }
  get profilePhotoUrl(): string | undefined { return this.props.profilePhotoUrl; }
  get notes(): string | undefined { return this.props.notes; }
  get tags(): string[] { return [...this.props.tags]; }
  get isActive(): boolean { return this.props.isActive; }
  get createdBy(): string | undefined { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
