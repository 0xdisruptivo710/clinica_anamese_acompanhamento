// Errors
export { DomainError } from './errors/DomainError';
export { ValidationError, NotFoundError } from './errors/ValidationError';

// Value Objects
export { UniqueId } from './value-objects/UniqueId';
export { ClientId } from './value-objects/ClientId';
export { SessionId } from './value-objects/SessionId';
export { ProcedureId } from './value-objects/ProcedureId';
export { PhotoId } from './value-objects/PhotoId';
export { ClinicId } from './value-objects/ClinicId';
export { ProfessionalId } from './value-objects/ProfessionalId';
export { SessionDate } from './value-objects/SessionDate';
export { ProcedureType, PROCEDURE_CATEGORIES, TREATMENT_AREAS } from './value-objects/ProcedureType';
export type { ProcedureCategory, TreatmentAreaType } from './value-objects/ProcedureType';
export { PhotoComparison } from './value-objects/PhotoComparison';

// Entities
export { Entity } from './entities/Entity';
export { Client } from './entities/Client';
export type { ClientProps, SkinType, FitzpatrickScale, MessageChannel } from './entities/Client';
export { Session } from './entities/Session';
export type { SessionProps, SessionStatus } from './entities/Session';
export { Procedure } from './entities/Procedure';
export type { ProcedureProps } from './entities/Procedure';
export { Photo } from './entities/Photo';
export type { PhotoProps, PhotoType, PhotoAngle } from './entities/Photo';
export { TreatmentArea } from './entities/TreatmentArea';

// Events
export type { DomainEvent } from './events/DomainEvent';
export { SessionCreated } from './events/SessionCreated';
export { SessionClosed } from './events/SessionClosed';
export { PhotoUploaded } from './events/PhotoUploaded';
export { ProcedureRecorded } from './events/ProcedureRecorded';
export { EvolutionReportGenerated } from './events/EvolutionReportGenerated';

// Repository Interfaces
export type { IClientRepository, PaginationOptions } from './repositories/IClientRepository';
export type { ISessionRepository } from './repositories/ISessionRepository';
export type { IPhotoRepository } from './repositories/IPhotoRepository';
export type { IProcedureRepository } from './repositories/IProcedureRepository';
