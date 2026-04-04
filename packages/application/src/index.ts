// Ports
export type { IEventBus } from './ports/IEventBus';
export type { IMessageService, SendMessageInput, SendMessageResult } from './ports/IMessageService';
export type { IAIService, PostSessionAIInput, PostSessionAIOutput } from './ports/IAIService';
export type { IStorageService, UploadResult } from './ports/IStorageService';

// DTOs
export type { CreateClientDTO } from './dtos/CreateClientDTO';
export type { UpdateClientDTO } from './dtos/UpdateClientDTO';
export type { CreateSessionDTO } from './dtos/CreateSessionDTO';
export type { RecordProcedureDTO } from './dtos/RecordProcedureDTO';
export type { UploadPhotoDTO } from './dtos/UploadPhotoDTO';
export type { EvolutionReportDTO, SessionSummaryDTO } from './dtos/EvolutionReportDTO';

// Use Cases — Client
export { CreateClientUseCase } from './use-cases/client/CreateClientUseCase';
export { UpdateClientUseCase } from './use-cases/client/UpdateClientUseCase';
export { GetClientUseCase } from './use-cases/client/GetClientUseCase';
export { ListClientsUseCase } from './use-cases/client/ListClientsUseCase';
export { GetClientEvolutionUseCase } from './use-cases/client/GetClientEvolutionUseCase';

// Use Cases — Session
export { CreateSessionUseCase } from './use-cases/session/CreateSessionUseCase';
export { StartSessionUseCase } from './use-cases/session/StartSessionUseCase';
export { CompleteSessionUseCase } from './use-cases/session/CompleteSessionUseCase';
export { RecordProcedureUseCase } from './use-cases/session/RecordProcedureUseCase';
export { ListSessionsUseCase } from './use-cases/session/ListSessionsUseCase';

// Use Cases — Photo
export { UploadSessionPhotoUseCase } from './use-cases/photo/UploadSessionPhotoUseCase';
export { ListSessionPhotosUseCase } from './use-cases/photo/ListSessionPhotosUseCase';
export { GenerateComparisonUseCase } from './use-cases/photo/GenerateComparisonUseCase';

// Use Cases — AI
export { GeneratePostSessionMessageUseCase } from './use-cases/ai/GeneratePostSessionMessageUseCase';
