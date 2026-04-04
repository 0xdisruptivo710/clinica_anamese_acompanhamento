# CLAUDE.md — AestheticTrack: Sistema de Acompanhamento Evolutivo de Clientes

> **Para Claude Code:** Este arquivo define a arquitetura completa, os sub-agentes de desenvolvimento, o esquema do banco de dados e todas as diretrizes do projeto. Leia este documento **integralmente** antes de escrever qualquer linha de código. Cada seção é mandatória.

---

## 📋 VISÃO GERAL DO PROJETO

**Nome do produto:** AestheticTrack  
**Tipo:** Aplicação web responsiva (PWA) + App mobile (React Native)  
**Propósito:** Sistema de acompanhamento evolutivo de clientes de clínica de estética facial e corporal, com gestão de sessões, comparação fotográfica, catalogação de procedimentos e comunicação pós-sessão com a cliente.

### Proposta de Valor Central
- 📸 **Galeria evolutiva inteligente** — comparação de fotos lado a lado (antes/depois, sessão a sessão)
- 📋 **Prontuário digital de procedimentos** — registro estruturado de cada sessão (Botox, preenchimento, Ultraformer, skinbooster, estimuladores, estética corporal)
- 🤖 **[FEATURE DISRUPTIVA] AestheticAI Assistant** — após cada sessão, o sistema gera automaticamente uma mensagem personalizada para a cliente via WhatsApp/e-mail com: resumo do que foi feito, cuidados pós-procedimento personalizados, previsão de retorno e um card visual "Sua evolução até aqui" com comparativo fotográfico
- 📊 **Dashboard de evolução** — linha do tempo visual com métricas e progresso por área tratada

---

## 🤖 SUB-AGENTES DO PROJETO

Claude Code deve operar com os seguintes sub-agentes especializados. Cada agente tem escopo, responsabilidades e protocolos de comunicação definidos.

---

### 🟦 AGENTE: `@dev-lead`
**Papel:** Arquiteto Principal & Desenvolvedor Full-Stack  
**Responsabilidades:**
- Definir e garantir a arquitetura limpa em todas as camadas
- Implementar domain entities, use cases, repositories interfaces
- Revisar PRs de outros agentes antes de qualquer merge
- Garantir que nenhuma camada viola a Dependency Rule
- Implementar a lógica de negócio central (domain layer)

**Protocolo:**
```
@dev-lead → sempre cria a interface antes da implementação concreta
@dev-lead → valida se cada novo arquivo pertence à camada correta
@dev-lead → define os contratos (DTOs, interfaces) que outros agentes consumirão
@dev-lead → nunca escreve SQL diretamente — usa o repositório abstrato
```

**Checklist antes de fechar qualquer feature:**
- [ ] Interface/abstração criada no domain?
- [ ] Use case isolado e testável?
- [ ] Nenhuma dependência de framework no domain?
- [ ] DTOs usados nas bordas da camada de aplicação?

---

### 🟩 AGENTE: `@dev-frontend`
**Papel:** Desenvolvedor Frontend & UX Engineer  
**Stack:** Next.js 14 (App Router) + React Native (Expo) + Tailwind CSS + Shadcn/ui  
**Responsabilidades:**
- Implementar todas as telas e componentes de UI
- Garantir design responsivo e acessível (WCAG AA)
- Implementar o comparador fotográfico interativo (slider antes/depois)
- Integrar com a camada de Interface Adapters (nunca diretamente com domínio)
- Implementar PWA manifest e service workers

**Protocolo:**
```
@dev-frontend → consome apenas DTOs/ViewModels, nunca entidades de domínio
@dev-frontend → componentes são puros e recebem dados via props ou hooks
@dev-frontend → estados globais apenas via Zustand (sem Redux)
@dev-frontend → sempre consulta @dev-lead para validar contratos de API
@dev-frontend → cria Storybook para cada componente reutilizável
```

**Padrão de estrutura de componente:**
```tsx
// ✅ Correto: componente puro, dados via props
interface SessionCardProps {
  session: SessionViewModel; // DTO, não entidade de domínio
  onViewPhotos: (sessionId: string) => void;
}
```

---

### 🟨 AGENTE: `@dev-backend`
**Papel:** Desenvolvedor Backend & API Engineer  
**Stack:** Next.js Route Handlers + TypeScript + Supabase SDK + Vercel Functions  
**Responsabilidades:**
- Implementar Route Handlers em `app/api/v1/` (rodam como Vercel Serverless Functions)
- Implementar os Repositories concretos (infra layer) contra o Supabase
- Implementar o serviço de envio de mensagens (WhatsApp via Evolution API / e-mail via Resend)
- Implementar upload e processamento de imagens (Supabase Storage + Sharp via Vercel Function)
- Garantir autenticação e autorização (Supabase Auth + RLS policies)
- Configurar Vercel Cron Jobs para tarefas agendadas (relatórios, follow-ups)

**Protocolo:**
```
@dev-backend → nunca contém lógica de negócio (isso é responsabilidade do domínio)
@dev-backend → implementa as interfaces definidas por @dev-lead
@dev-backend → toda rota é versionada: /api/v1/
@dev-backend → usa chaves de idempotência em endpoints de escrita
@dev-backend → retries com backoff exponencial em integrações externas
@dev-backend → Vercel Functions têm timeout máximo de 60s (plano Pro) — operações longas vão para jobs
@dev-backend → operações assíncronas longas (IA, envio de mensagem) disparam via Upstash QStash
```

**Atenção — limites do Vercel Functions:**
```typescript
// vercel.json — configurar timeout por rota
{
  "functions": {
    "app/api/v1/ai/**": { "maxDuration": 60 },
    "app/api/v1/photos/upload": { "maxDuration": 30 },
    "app/api/v1/**": { "maxDuration": 15 }
  }
}
```

---

### 🟥 AGENTE: `@devops`
**Papel:** Engenheiro de Infraestrutura & CI/CD  
**Stack:** GitHub Actions + Vercel (frontend + backend serverless) + Supabase  
**Responsabilidades:**
- Configurar pipelines CI/CD completos integrados ao Vercel
- Gerenciar migrations do Supabase via CLI
- Configurar ambientes Vercel (development, preview, production)
- Implementar monitoramento (Sentry + Vercel Analytics + Speed Insights)
- Gerenciar secrets via Vercel Environment Variables (nunca em código)
- Configurar backups automatizados do Supabase
- Configurar Vercel Edge Config para feature flags
- Gerenciar domínios customizados e certificados SSL no Vercel

**Protocolo:**
```
@devops → toda migration passa por code review antes de rodar em prod
@devops → ambientes Vercel preview (por PR) e production são isolados
@devops → secrets NUNCA no código — sempre em Vercel Environment Variables
@devops → configura Vercel project settings: framework=Next.js, root=apps/web
@devops → habilita Vercel Edge Config para feature flags sem redeploy
@devops → configura Vercel Cron Jobs para tarefas agendadas (ex: relatórios)
@devops → define health check em /api/health para monitoramento
@devops → documenta runbooks para operações críticas
```

**Pipeline CI/CD obrigatório (GitHub Actions + Vercel):**
```yaml
# Fluxo: PR → lint → test → Vercel Preview Deploy → smoke test → Vercel Production Deploy

# Vercel cuida automaticamente do deploy; GitHub Actions cuida da qualidade:
stages:
  - lint          (ESLint + Prettier + TypeScript check)
  - unit-tests    (Jest/Vitest — roda em todo PR)
  - integration   (Vitest + Supertest contra Supabase local)
  - e2e-tests     (Playwright contra Vercel Preview URL)
  - security-scan (Snyk)
  - build-check   (vercel build --prod --dry-run)
  # ↓ Automático pelo Vercel via GitHub integration
  - preview-deploy    (a cada PR — URL única de preview)
  - smoke-tests       (Playwright na preview URL)
  - production-deploy (merge na main → Vercel Production)
```

---

### 🟪 AGENTE: `@qa`
**Papel:** Engenheiro de Qualidade & Teste  
**Stack:** Jest + Vitest + Playwright + Testing Library  
**Responsabilidades:**
- Escrever e manter todos os testes (unit, integration, e2e)
- Definir critérios de aceite para cada feature
- Validar cobertura mínima de 80% no domínio e use cases
- Escrever testes de contrato para APIs internas
- Executar testes de regressão visual (Chromatic)

**Protocolo:**
```
@qa → testes são escritos JUNTO com a feature (não depois)
@qa → domínio e use cases: cobertura mínima 80%
@qa → toda integração externa tem mock (nunca chama APIs reais em testes)
@qa → cenários de falha são tão importantes quanto os de sucesso
@qa → reporta para @dev-lead qualquer violação arquitetural encontrada em testes
```

**Template de teste obrigatório para use cases:**
```typescript
describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;
  let mockSessionRepository: jest.Mocked<ISessionRepository>;
  let mockEventBus: jest.Mocked<IEventBus>;

  beforeEach(() => {
    mockSessionRepository = createMockRepository<ISessionRepository>();
    mockEventBus = createMockEventBus();
    useCase = new CreateSessionUseCase(mockSessionRepository, mockEventBus);
  });

  it('should create session and emit SessionCreated event', async () => { /* ... */ });
  it('should throw if client does not exist', async () => { /* ... */ });
  it('should be idempotent with same idempotency key', async () => { /* ... */ });
});
```

---

### 🤍 AGENTE: `@ai-feature`
**Papel:** Engenheiro de IA & Automação  
**Stack:** Anthropic Claude API + LangChain.js + Bull Queue (jobs assíncronos)  
**Responsabilidades:**
- Implementar o AestheticAI Assistant (geração de mensagens pós-sessão)
- Implementar análise comparativa de fotos com IA
- Criar os prompts e chains para geração de conteúdo personalizado
- Integrar com Evolution API (WhatsApp) e Resend (e-mail)
- Gerenciar a fila de jobs assíncronos de notificação

**Protocolo:**
```
@ai-feature → toda chamada à API de IA é assíncrona (job queue)
@ai-feature → prompts são versionados e testados com golden outputs
@ai-feature → fallback obrigatório se API de IA falhar (mensagem template)
@ai-feature → custo de tokens é monitorado por cliente/sessão
@ai-feature → conteúdo gerado passa por validação antes de enviar à cliente
```

---

## 🏗️ ARQUITETURA DO SISTEMA

### Stack Tecnológico Completo

| Camada | Tecnologia |
|--------|-----------|
| Frontend Web | Next.js 14 (App Router) + TypeScript |
| Frontend Mobile | React Native (Expo SDK 51) |
| Design System | Tailwind CSS + Shadcn/ui + Radix UI |
| State Management | Zustand + React Query (TanStack) |
| Backend / API | Next.js Route Handlers + Vercel Functions (serverless) |
| Job Queue / Async | Vercel Cron Jobs + BullMQ + Redis (Upstash) |
| ORM / DB Client | Supabase SDK + Drizzle ORM |
| Banco de Dados | Supabase (PostgreSQL 15) |
| Storage de Arquivos | Supabase Storage (fotos das clientes) |
| Autenticação | Supabase Auth (magic link + OAuth Google) |
| Mensageria | Evolution API (WhatsApp) + Resend (e-mail) |
| IA | Anthropic Claude API (claude-sonnet) |
| Deploy & Hosting | Vercel (web + API serverless + edge functions) |
| Monitoramento | Sentry + Vercel Analytics + Vercel Speed Insights |
| CI/CD | GitHub Actions + Vercel Git Integration |
| Testes | Jest + Vitest + Playwright + Testing Library |

---

### Estrutura de Pastas (Monorepo)

```
aesthetic-track/
├── apps/
│   ├── web/                          # Next.js 14 — deploy na Vercel
│   │   ├── app/                      # App Router
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── clients/
│   │   │   │   ├── sessions/
│   │   │   │   └── reports/
│   │   │   └── api/                  # ← Backend via Vercel Functions (Route Handlers)
│   │   │       ├── v1/
│   │   │       │   ├── clients/
│   │   │       │   │   └── route.ts
│   │   │       │   ├── sessions/
│   │   │       │   │   └── route.ts
│   │   │       │   ├── photos/
│   │   │       │   │   └── route.ts
│   │   │       │   └── ai/
│   │   │       │       └── post-session/
│   │   │       │           └── route.ts
│   │   │       ├── webhooks/         # Webhooks externos (Evolution API, Resend)
│   │   │       │   ├── whatsapp/
│   │   │       │   └── email/
│   │   │       └── health/
│   │   │           └── route.ts      # Health check obrigatório
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn components
│   │   │   ├── features/
│   │   │   │   ├── photo-comparator/ # Slider antes/depois
│   │   │   │   ├── session-form/
│   │   │   │   └── evolution-timeline/
│   │   │   └── shared/
│   │   ├── lib/
│   │   │   ├── hooks/
│   │   │   ├── stores/               # Zustand stores
│   │   │   └── api-client/           # Type-safe API client
│   │   └── vercel.json               # Config Vercel (rewrites, headers, crons)
│   │
│   └── mobile/                       # React Native (Expo) — deploy via EAS
│       ├── app/                      # Expo Router
│       ├── components/
│       └── lib/
│
├── packages/
│   ├── domain/                       # 🔴 CAMADA MAIS INTERNA
│   │   ├── entities/
│   │   │   ├── Client.ts
│   │   │   ├── Session.ts
│   │   │   ├── Procedure.ts
│   │   │   ├── Photo.ts
│   │   │   └── TreatmentArea.ts
│   │   ├── value-objects/
│   │   │   ├── ClientId.ts
│   │   │   ├── SessionDate.ts
│   │   │   ├── ProcedureType.ts
│   │   │   └── PhotoComparison.ts
│   │   ├── repositories/             # Interfaces (abstrações)
│   │   │   ├── IClientRepository.ts
│   │   │   ├── ISessionRepository.ts
│   │   │   ├── IPhotoRepository.ts
│   │   │   └── IProcedureRepository.ts
│   │   ├── events/                   # Domain Events
│   │   │   ├── SessionCreated.ts
│   │   │   ├── PhotoUploaded.ts
│   │   │   ├── ProcedureRecorded.ts
│   │   │   └── EvolutionReportGenerated.ts
│   │   └── errors/
│   │       ├── DomainError.ts
│   │       └── ValidationError.ts
│   │
│   ├── application/                  # 🟡 USE CASES
│   │   ├── use-cases/
│   │   │   ├── client/
│   │   │   │   ├── CreateClientUseCase.ts
│   │   │   │   ├── UpdateClientUseCase.ts
│   │   │   │   └── GetClientEvolutionUseCase.ts
│   │   │   ├── session/
│   │   │   │   ├── CreateSessionUseCase.ts
│   │   │   │   ├── RecordProcedureUseCase.ts
│   │   │   │   └── CloseSessionUseCase.ts
│   │   │   ├── photo/
│   │   │   │   ├── UploadSessionPhotoUseCase.ts
│   │   │   │   └── GenerateComparisonUseCase.ts
│   │   │   └── ai/
│   │   │       ├── GeneratePostSessionMessageUseCase.ts
│   │   │       └── AnalyzeEvolutionUseCase.ts
│   │   ├── dtos/
│   │   │   ├── CreateClientDTO.ts
│   │   │   ├── CreateSessionDTO.ts
│   │   │   ├── RecordProcedureDTO.ts
│   │   │   └── EvolutionReportDTO.ts
│   │   └── ports/                    # Interfaces de saída
│   │       ├── IEventBus.ts
│   │       ├── IMessageService.ts
│   │       ├── IAIService.ts
│   │       └── IStorageService.ts
│   │
│   ├── infrastructure/               # 🟢 IMPLEMENTAÇÕES CONCRETAS
│   │   ├── repositories/
│   │   │   ├── SupabaseClientRepository.ts
│   │   │   ├── SupabaseSessionRepository.ts
│   │   │   └── SupabasePhotoRepository.ts
│   │   ├── services/
│   │   │   ├── EvolutionAPIMessageService.ts
│   │   │   ├── ResendEmailService.ts
│   │   │   ├── ClaudeAIService.ts
│   │   │   ├── SupabaseStorageService.ts
│   │   │   └── UpstashEventBus.ts    # BullMQ via Upstash Redis
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── schema/               # Drizzle schema
│   │   └── jobs/
│   │       ├── PostSessionNotificationJob.ts
│   │       └── EvolutionReportJob.ts
│   │
│   └── shared/                       # Utilitários compartilhados
│       ├── types/
│       ├── utils/
│       └── constants/
│
├── supabase/
│   ├── migrations/                   # SQL migrations versionadas
│   ├── functions/                    # Supabase Edge Functions (fallback/webhooks)
│   │   ├── post-session-trigger/
│   │   └── generate-report/
│   └── seed.sql
│
├── turbo.json                        # Turborepo config
└── package.json
```

---

## 🗄️ BANCO DE DADOS — SUPABASE (PostgreSQL)

> **Instrução para @devops:** Execute as migrations abaixo em ordem via `supabase db push` ou pelo Dashboard do Supabase em SQL Editor.

### Migration 001 — Extensões e Schemas

```sql
-- 001_extensions_and_schemas.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- busca textual
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- busca sem acentos

-- Schemas separados por domínio
CREATE SCHEMA IF NOT EXISTS aesthetic;
CREATE SCHEMA IF NOT EXISTS audit;

-- Função utilitária para updated_at automático
CREATE OR REPLACE FUNCTION aesthetic.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Migration 002 — Enums

```sql
-- 002_enums.sql

CREATE TYPE aesthetic.procedure_category AS ENUM (
  'facial_botox',
  'facial_filler',
  'facial_stimulator',
  'facial_skinbooster',
  'facial_ultraformer',
  'facial_laser',
  'facial_peel',
  'facial_led',
  'facial_microneedling',
  'body_lipolysis',
  'body_ultraformer',
  'body_radiofrequency',
  'body_cavitation',
  'body_lymphatic_drainage',
  'body_cryolipolysis',
  'other'
);

CREATE TYPE aesthetic.treatment_area AS ENUM (
  -- Facial
  'forehead', 'glabella', 'crow_feet', 'bunny_lines',
  'nasolabial_folds', 'marionette_lines', 'lip_upper', 'lip_lower',
  'lip_commissure', 'chin', 'jaw', 'neck', 'under_eye', 'cheekbones',
  'nose', 'temple', 'full_face',
  -- Corporal
  'abdomen', 'flanks', 'arms', 'inner_thighs', 'outer_thighs',
  'buttocks', 'back', 'chest', 'full_body'
);

CREATE TYPE aesthetic.session_status AS ENUM (
  'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
);

CREATE TYPE aesthetic.photo_type AS ENUM (
  'before', 'after', 'during', 'progress', 'reference'
);

CREATE TYPE aesthetic.photo_angle AS ENUM (
  'frontal', 'left_profile', 'right_profile',
  'left_three_quarters', 'right_three_quarters', 'superior', 'inferior'
);

CREATE TYPE aesthetic.message_channel AS ENUM (
  'whatsapp', 'email', 'sms'
);

CREATE TYPE aesthetic.message_status AS ENUM (
  'pending', 'sent', 'delivered', 'read', 'failed'
);

CREATE TYPE aesthetic.skin_type AS ENUM (
  'normal', 'dry', 'oily', 'combination', 'sensitive'
);

CREATE TYPE aesthetic.fitzpatrick_scale AS ENUM (
  'I', 'II', 'III', 'IV', 'V', 'VI'
);
```

---

### Migration 003 — Clínica e Profissionais

```sql
-- 003_clinic_and_professionals.sql

CREATE TABLE aesthetic.clinics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  cnpj          TEXT UNIQUE,
  phone         TEXT,
  email         TEXT,
  address       JSONB, -- { street, number, city, state, zip, country }
  logo_url      TEXT,
  settings      JSONB DEFAULT '{}', -- configurações da clínica
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER aesthetic_clinics_updated_at
  BEFORE UPDATE ON aesthetic.clinics
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_updated_at();

-- Profissionais (ligados ao auth.users do Supabase)
CREATE TABLE aesthetic.professionals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id       UUID NOT NULL REFERENCES aesthetic.clinics(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  crf_crm         TEXT, -- conselho profissional
  specialty       TEXT,
  role            TEXT NOT NULL DEFAULT 'aesthetician', -- aesthetician, doctor, admin
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, clinic_id)
);

CREATE TRIGGER aesthetic_professionals_updated_at
  BEFORE UPDATE ON aesthetic.professionals
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_updated_at();

-- Índices
CREATE INDEX idx_professionals_clinic ON aesthetic.professionals(clinic_id);
CREATE INDEX idx_professionals_user ON aesthetic.professionals(user_id);
```

---

### Migration 004 — Clientes (Core)

```sql
-- 004_clients.sql

CREATE TABLE aesthetic.clients (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id           UUID NOT NULL REFERENCES aesthetic.clinics(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL,
  date_of_birth       DATE,
  cpf                 TEXT,
  phone               TEXT NOT NULL,
  whatsapp            TEXT,
  email               TEXT,
  address             JSONB,
  
  -- Anamnese Estética
  skin_type           aesthetic.skin_type,
  fitzpatrick         aesthetic.fitzpatrick_scale,
  allergies           TEXT[],
  medications         TEXT[],
  medical_conditions  TEXT[],
  previous_procedures TEXT[],
  aesthetic_goals     TEXT,   -- objetivos da cliente
  
  -- Preferências de comunicação
  preferred_channel   aesthetic.message_channel DEFAULT 'whatsapp',
  communication_opt_in BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  profile_photo_url   TEXT,
  notes               TEXT,
  tags                TEXT[],
  is_active           BOOLEAN DEFAULT TRUE,
  
  -- Auditoria
  created_by          UUID REFERENCES aesthetic.professionals(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER aesthetic_clients_updated_at
  BEFORE UPDATE ON aesthetic.clients
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_updated_at();

-- Índices para busca
CREATE INDEX idx_clients_clinic ON aesthetic.clients(clinic_id);
CREATE INDEX idx_clients_name ON aesthetic.clients USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_clients_phone ON aesthetic.clients(phone);
CREATE INDEX idx_clients_cpf ON aesthetic.clients(cpf);
CREATE INDEX idx_clients_tags ON aesthetic.clients USING gin(tags);
```

---

### Migration 005 — Sessões

```sql
-- 005_sessions.sql

CREATE TABLE aesthetic.sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id           UUID NOT NULL REFERENCES aesthetic.clinics(id),
  client_id           UUID NOT NULL REFERENCES aesthetic.clients(id) ON DELETE CASCADE,
  professional_id     UUID NOT NULL REFERENCES aesthetic.professionals(id),
  
  session_number      INTEGER, -- número sequencial por cliente (1ª sessão, 2ª sessão...)
  session_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status              aesthetic.session_status DEFAULT 'scheduled',
  
  -- Duração e financeiro
  duration_minutes    INTEGER,
  total_value         DECIMAL(10,2),
  
  -- Avaliação pré-sessão
  pre_session_notes   TEXT,
  client_complaint    TEXT,   -- queixa principal da cliente na sessão
  pain_score          SMALLINT CHECK (pain_score BETWEEN 0 AND 10),
  
  -- Avaliação pós-sessão
  post_session_notes  TEXT,
  professional_notes  TEXT,   -- anotações técnicas do profissional
  follow_up_date      DATE,   -- data recomendada para retorno
  
  -- Consentimento
  consent_signed      BOOLEAN DEFAULT FALSE,
  consent_signed_at   TIMESTAMPTZ,
  
  -- Metadata
  idempotency_key     TEXT UNIQUE, -- para evitar sessões duplicadas
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER aesthetic_sessions_updated_at
  BEFORE UPDATE ON aesthetic.sessions
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_updated_at();

-- Auto-incrementa session_number por cliente
CREATE OR REPLACE FUNCTION aesthetic.set_session_number()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(session_number), 0) + 1
  INTO NEW.session_number
  FROM aesthetic.sessions
  WHERE client_id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aesthetic_sessions_set_number
  BEFORE INSERT ON aesthetic.sessions
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_session_number();

-- Índices
CREATE INDEX idx_sessions_client ON aesthetic.sessions(client_id);
CREATE INDEX idx_sessions_clinic ON aesthetic.sessions(clinic_id);
CREATE INDEX idx_sessions_date ON aesthetic.sessions(session_date DESC);
CREATE INDEX idx_sessions_status ON aesthetic.sessions(status);
CREATE INDEX idx_sessions_professional ON aesthetic.sessions(professional_id);
```

---

### Migration 006 — Procedimentos da Sessão

```sql
-- 006_procedures.sql

-- Catálogo de produtos/insumos
CREATE TABLE aesthetic.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES aesthetic.clinics(id),
  name            TEXT NOT NULL,
  brand           TEXT,
  category        aesthetic.procedure_category,
  unit            TEXT DEFAULT 'ml', -- ml, unidade, fl, etc.
  cost_per_unit   DECIMAL(10,2),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Procedimentos realizados em cada sessão
CREATE TABLE aesthetic.session_procedures (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID NOT NULL REFERENCES aesthetic.sessions(id) ON DELETE CASCADE,
  
  category          aesthetic.procedure_category NOT NULL,
  procedure_name    TEXT NOT NULL,         -- ex: "Botox Allergan 20U Frontal"
  
  -- Área tratada
  treatment_areas   aesthetic.treatment_area[],
  side              TEXT,                  -- left, right, bilateral
  
  -- Detalhes técnicos (JSON flexível por tipo de procedimento)
  technical_details JSONB DEFAULT '{}',
  /*
    Exemplos de technical_details:
    
    BOTOX: {
      "product": "Allergan Botox",
      "total_units": 20,
      "dilution": "2.5ml",
      "points": [{"area": "forehead", "units": 10, "depth": "intradermal"}],
      "lot_number": "12345",
      "expiry_date": "2025-12"
    }
    
    PREENCHIMENTO: {
      "product": "Juvederm Ultra",
      "volume_ml": 1.0,
      "technique": "linear retrograde",
      "cannula_needle": "cannula 25g",
      "depth": "subdermal"
    }
    
    ULTRAFORMER: {
      "cartridge": "MMFU 4.5mm",
      "energy": 0.8,
      "shots": 300,
      "intervals": "5mm"
    }
    
    SKINBOOSTER: {
      "product": "Restylane Vital",
      "technique": "nappage",
      "sessions_protocol": 3
    }
  */
  
  -- Produto do catálogo (opcional)
  product_id        UUID REFERENCES aesthetic.products(id),
  quantity_used     DECIMAL(10,3),
  
  -- Resultados e observações
  immediate_result  TEXT,
  complications     TEXT[],
  
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procedures_session ON aesthetic.session_procedures(session_id);
CREATE INDEX idx_procedures_category ON aesthetic.session_procedures(category);
CREATE INDEX idx_procedures_areas ON aesthetic.session_procedures USING gin(treatment_areas);
```

---

### Migration 007 — Fotos e Galeria

```sql
-- 007_photos.sql

CREATE TABLE aesthetic.session_photos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES aesthetic.sessions(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES aesthetic.clients(id) ON DELETE CASCADE,
  
  -- Arquivo
  storage_path    TEXT NOT NULL,    -- path no Supabase Storage
  url             TEXT NOT NULL,    -- URL pública ou signed URL
  thumbnail_url   TEXT,
  
  -- Classificação
  photo_type      aesthetic.photo_type NOT NULL,
  angle           aesthetic.photo_angle,
  treatment_area  aesthetic.treatment_area,
  
  -- Metadados da foto
  taken_at        TIMESTAMPTZ DEFAULT NOW(),
  width_px        INTEGER,
  height_px       INTEGER,
  file_size_bytes INTEGER,
  
  -- Análise IA (opcional, processamento assíncrono)
  ai_analysis     JSONB,           -- resultado da análise de IA
  ai_analyzed_at  TIMESTAMPTZ,
  
  -- Anotações
  caption         TEXT,
  is_featured     BOOLEAN DEFAULT FALSE, -- foto destaque para comparativo
  is_consent_ok   BOOLEAN DEFAULT TRUE,
  
  created_by      UUID REFERENCES aesthetic.professionals(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Comparações antes/depois configuradas manualmente
CREATE TABLE aesthetic.photo_comparisons (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id         UUID NOT NULL REFERENCES aesthetic.clients(id),
  before_photo_id   UUID NOT NULL REFERENCES aesthetic.session_photos(id),
  after_photo_id    UUID NOT NULL REFERENCES aesthetic.session_photos(id),
  title             TEXT,          -- ex: "6 meses de tratamento"
  notes             TEXT,
  is_shareable      BOOLEAN DEFAULT FALSE, -- cliente pode ver
  created_by        UUID REFERENCES aesthetic.professionals(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER aesthetic_photos_updated_at
  BEFORE UPDATE ON aesthetic.session_photos
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_updated_at();

CREATE INDEX idx_photos_session ON aesthetic.session_photos(session_id);
CREATE INDEX idx_photos_client ON aesthetic.session_photos(client_id);
CREATE INDEX idx_photos_type ON aesthetic.session_photos(photo_type);
CREATE INDEX idx_comparisons_client ON aesthetic.photo_comparisons(client_id);
```

---

### Migration 008 — Mensagens e Notificações (Feature Disruptiva)

```sql
-- 008_messages_and_ai.sql

-- Template de mensagens pós-sessão
CREATE TABLE aesthetic.message_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES aesthetic.clinics(id),
  name            TEXT NOT NULL,
  procedure_category aesthetic.procedure_category,  -- template específico por procedimento
  channel         aesthetic.message_channel DEFAULT 'whatsapp',
  subject         TEXT,               -- para e-mail
  body_template   TEXT NOT NULL,      -- com variáveis: {{client_name}}, {{procedure}}, etc.
  variables       TEXT[],             -- lista de variáveis disponíveis
  is_ai_enhanced  BOOLEAN DEFAULT TRUE, -- se IA personaliza o template
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Mensagens enviadas às clientes
CREATE TABLE aesthetic.client_messages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id           UUID NOT NULL REFERENCES aesthetic.clinics(id),
  client_id           UUID NOT NULL REFERENCES aesthetic.clients(id),
  session_id          UUID REFERENCES aesthetic.sessions(id),
  template_id         UUID REFERENCES aesthetic.message_templates(id),
  
  channel             aesthetic.message_channel NOT NULL,
  status              aesthetic.message_status DEFAULT 'pending',
  
  -- Conteúdo gerado
  subject             TEXT,
  body                TEXT NOT NULL,        -- conteúdo final (com IA ou não)
  is_ai_generated     BOOLEAN DEFAULT FALSE,
  ai_prompt_version   TEXT,
  
  -- Card visual evolutivo (URL para imagem gerada)
  evolution_card_url  TEXT,
  
  -- Metadados de envio
  scheduled_for       TIMESTAMPTZ,
  sent_at             TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  read_at             TIMESTAMPTZ,
  
  -- Resposta/retorno da API de mensageria
  external_message_id TEXT,
  error_details       JSONB,
  
  -- Idempotência
  idempotency_key     TEXT UNIQUE,
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER aesthetic_messages_updated_at
  BEFORE UPDATE ON aesthetic.client_messages
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_updated_at();

-- Log de geração de conteúdo IA
CREATE TABLE aesthetic.ai_generation_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID REFERENCES aesthetic.sessions(id),
  message_id      UUID REFERENCES aesthetic.client_messages(id),
  
  model           TEXT NOT NULL,       -- ex: claude-sonnet-4-20250514
  prompt_tokens   INTEGER,
  completion_tokens INTEGER,
  total_cost_usd  DECIMAL(10,6),
  
  input_data      JSONB,               -- dados enviados ao modelo
  output_data     JSONB,               -- resposta do modelo
  duration_ms     INTEGER,
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_client ON aesthetic.client_messages(client_id);
CREATE INDEX idx_messages_session ON aesthetic.client_messages(session_id);
CREATE INDEX idx_messages_status ON aesthetic.client_messages(status);
CREATE INDEX idx_messages_scheduled ON aesthetic.client_messages(scheduled_for);
CREATE INDEX idx_ai_log_session ON aesthetic.ai_generation_log(session_id);
```

---

### Migration 009 — Auditoria e Segurança

```sql
-- 009_audit.sql

-- Tabela de auditoria genérica
CREATE TABLE audit.activity_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id     UUID,
  user_id       UUID,
  action        TEXT NOT NULL,     -- CREATE, UPDATE, DELETE, VIEW
  resource_type TEXT NOT NULL,     -- clients, sessions, photos, etc.
  resource_id   UUID,
  changes       JSONB,             -- diff antes/depois
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_clinic ON audit.activity_log(clinic_id);
CREATE INDEX idx_audit_user ON audit.activity_log(user_id);
CREATE INDEX idx_audit_resource ON audit.activity_log(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit.activity_log(created_at DESC);
```

---

### Migration 010 — Row Level Security (RLS)

```sql
-- 010_rls_policies.sql
-- SEGURANÇA: Cada clínica só vê seus próprios dados

ALTER TABLE aesthetic.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.session_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.session_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.client_messages ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: retorna clinic_id do usuário autenticado
CREATE OR REPLACE FUNCTION aesthetic.get_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM aesthetic.professionals
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas para clients
CREATE POLICY "professionals_view_own_clinic_clients"
  ON aesthetic.clients FOR SELECT
  USING (clinic_id = aesthetic.get_user_clinic_id());

CREATE POLICY "professionals_insert_own_clinic_clients"
  ON aesthetic.clients FOR INSERT
  WITH CHECK (clinic_id = aesthetic.get_user_clinic_id());

CREATE POLICY "professionals_update_own_clinic_clients"
  ON aesthetic.clients FOR UPDATE
  USING (clinic_id = aesthetic.get_user_clinic_id());

-- Políticas para sessions
CREATE POLICY "professionals_manage_own_clinic_sessions"
  ON aesthetic.sessions FOR ALL
  USING (clinic_id = aesthetic.get_user_clinic_id());

-- Políticas para fotos
CREATE POLICY "professionals_manage_own_clinic_photos"
  ON aesthetic.session_photos FOR ALL
  USING (
    client_id IN (
      SELECT id FROM aesthetic.clients
      WHERE clinic_id = aesthetic.get_user_clinic_id()
    )
  );

-- Políticas para mensagens
CREATE POLICY "professionals_manage_own_clinic_messages"
  ON aesthetic.client_messages FOR ALL
  USING (clinic_id = aesthetic.get_user_clinic_id());
```

---

### Migration 011 — Views e Funções Auxiliares

```sql
-- 011_views_and_functions.sql

-- View: Resumo evolutivo de cliente
CREATE OR REPLACE VIEW aesthetic.client_evolution_summary AS
SELECT
  c.id AS client_id,
  c.full_name,
  c.clinic_id,
  COUNT(DISTINCT s.id) AS total_sessions,
  COUNT(DISTINCT sp.id) AS total_procedures,
  COUNT(DISTINCT ph.id) AS total_photos,
  MIN(s.session_date) AS first_session_date,
  MAX(s.session_date) AS last_session_date,
  ARRAY_AGG(DISTINCT sp.category) FILTER (WHERE sp.category IS NOT NULL) AS procedure_types,
  SUM(s.total_value) AS total_invested
FROM aesthetic.clients c
LEFT JOIN aesthetic.sessions s ON s.client_id = c.id AND s.status = 'completed'
LEFT JOIN aesthetic.session_procedures sp ON sp.session_id = s.id
LEFT JOIN aesthetic.session_photos ph ON ph.client_id = c.id
GROUP BY c.id, c.full_name, c.clinic_id;

-- Função: Busca clientes com pesquisa full-text
CREATE OR REPLACE FUNCTION aesthetic.search_clients(
  p_clinic_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  phone TEXT,
  profile_photo_url TEXT,
  total_sessions BIGINT,
  last_session_date TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.full_name,
    c.phone,
    c.profile_photo_url,
    COUNT(s.id) AS total_sessions,
    MAX(s.session_date) AS last_session_date,
    ts_rank(to_tsvector('portuguese', unaccent(c.full_name)), 
            plainto_tsquery('portuguese', unaccent(p_query))) AS rank
  FROM aesthetic.clients c
  LEFT JOIN aesthetic.sessions s ON s.client_id = c.id
  WHERE c.clinic_id = p_clinic_id
    AND c.is_active = TRUE
    AND (
      c.full_name ILIKE '%' || p_query || '%'
      OR c.phone ILIKE '%' || p_query || '%'
      OR c.cpf ILIKE '%' || p_query || '%'
    )
  GROUP BY c.id, c.full_name, c.phone, c.profile_photo_url
  ORDER BY rank DESC, c.full_name
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎨 FUNCIONALIDADES DETALHADAS

### F1 — Cadastro e Anamnese de Clientes
- Formulário completo com dados pessoais + anamnese estética
- Upload de foto de perfil (câmera ou galeria)
- Histórico de procedimentos pré-existentes
- Alergias, medicamentos, condições médicas
- Escala de Fitzpatrick e tipo de pele
- Tags personalizadas (VIP, contrato, etc.)

### F2 — Gestão de Sessões
- Agendamento com data/hora e profissional responsável
- Registro de queixa principal e avaliação pré-sessão
- Múltiplos procedimentos por sessão
- Formulário técnico dinâmico por tipo de procedimento:
  - **Botox:** produto, diluição, unidades por ponto, mapa facial interativo
  - **Preenchimento:** produto, volume, técnica, profundidade, cânula
  - **Ultraformer:** cartucho, energia, disparos, protocolo
  - **Skinbooster:** produto, técnica de aplicação, sessões do protocolo
  - **Estimuladores:** produto, volume, área, protocolo de sessões
- Score de dor (0-10) antes e após
- Assinatura digital de consentimento

### F3 — Galeria Fotográfica Evolutiva
- Upload de fotos por ângulo (frontal, perfil esquerdo/direito, ¾)
- Classificação: antes, durante, após, progresso
- **Slider interativo antes/depois** (arrastar divisória entre as fotos)
- **Timeline visual** de evolução — todas as fotos da cliente na linha do tempo
- **Comparação multi-sessão** — grid de fotos por ângulo ao longo do tempo
- Marcação de foto destaque para relatórios
- Zoom e anotações sobre a foto

### F4 — [FEATURE DISRUPTIVA] AestheticAI Post-Session Flow

**Fluxo completo após encerramento de uma sessão:**

```
1. Profissional clica em "Finalizar Sessão"
2. Sistema dispara evento: SessionClosed
3. Job assíncrono é criado na fila (BullMQ)
4. @ai-feature processa o job:
   a. Coleta dados: cliente, procedimentos realizados, fotos da sessão
   b. Recupera histórico completo da cliente
   c. Monta prompt contextualizado para o Claude API
   d. Gera conteúdo personalizado:
      - Mensagem de WhatsApp calorosa e profissional
      - Cuidados pós-procedimento específicos (para cada procedimento realizado)
      - Previsão de resultados esperados nos próximos dias
      - Recomendações de retorno personalizadas
      - Frase motivacional sobre a evolução
   e. Gera "Evolution Card":
      - Card visual (imagem) com foto antes vs. hoje
      - Número da sessão, data, procedimentos realizados
      - Frase sobre a evolução
   f. Profissional revisa e aprova (ou edita) o conteúdo
   g. Sistema envia via WhatsApp (Evolution API) ou e-mail (Resend)
5. Registro de envio na tabela client_messages
6. Tracking de entrega e leitura
```

**Prompt template para o Claude API:**
```typescript
const POST_SESSION_PROMPT = `
Você é uma assistente especializada em comunicação de clínicas de estética de alto padrão.
Gere uma mensagem personalizada para enviar à cliente após a sessão.

DADOS DA SESSÃO:
- Cliente: {{client_name}} ({{client_age}} anos)
- Sessão número: {{session_number}} 
- Data: {{session_date}}
- Procedimentos realizados: {{procedures_list}}
- Áreas tratadas: {{treatment_areas}}
- Profissional: {{professional_name}}

HISTÓRICO DA CLIENTE:
- Total de sessões anteriores: {{total_sessions}}
- Procedimentos anteriores: {{previous_procedures}}
- Objetivo estético declarado: {{aesthetic_goal}}

INSTRUÇÕES:
1. Tom: caloroso, profissional, empático, nunca genérico
2. Inclua o nome da cliente naturalmente na mensagem
3. Mencione especificamente o que foi feito hoje
4. Forneça cuidados pós-procedimento ESPECÍFICOS para {{procedures_list}}
5. Inclua expectativa de resultado realista para os próximos dias
6. Mencione evolução se sessão_number > 1
7. Finalize com data sugerida de retorno: {{follow_up_date}}
8. Máximo 250 palavras para WhatsApp
9. Use emojis com moderação (2-3 no máximo)

Retorne APENAS um JSON com:
{
  "whatsapp_message": "...",
  "email_subject": "...",
  "email_body": "...",
  "post_care_tips": ["...", "..."],
  "expected_results_timeline": "...",
  "motivational_note": "..."
}
`;
```

### F5 — Dashboard e Relatórios
- **Dashboard da clínica:** sessões do dia, semana, receita
- **Perfil evolutivo da cliente:** linha do tempo completa, todas as fotos, todos os procedimentos
- **Relatório de procedimentos:** quais procedimentos mais realizados, por área
- **Mapa de calor facial:** visualização das áreas mais tratadas na clínica
- **Relatório antes/depois:** seleção de foto inicial + atual para comparativo profissional

---

## 📏 PADRÕES DE CÓDIGO OBRIGATÓRIOS

### Entidade de Domínio (exemplo)

```typescript
// packages/domain/entities/Client.ts
// @dev-lead — Entidade rica com comportamento, não anêmica

import { ClientId } from '../value-objects/ClientId';
import { ClientCreated } from '../events/ClientCreated';

export interface ClientProps {
  id: ClientId;
  clinicId: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  skinType?: SkinType;
  aestheticGoals?: string;
  isActive: boolean;
  createdAt: Date;
}

export class Client {
  private readonly _domainEvents: DomainEvent[] = [];

  private constructor(private readonly props: ClientProps) {}

  static create(props: Omit<ClientProps, 'id' | 'createdAt' | 'isActive'>): Client {
    const client = new Client({
      ...props,
      id: ClientId.generate(),
      isActive: true,
      createdAt: new Date(),
    });

    client._domainEvents.push(new ClientCreated({
      clientId: client.props.id.value,
      clinicId: client.props.clinicId,
      fullName: client.props.fullName,
    }));

    return client;
  }

  static reconstitute(props: ClientProps): Client {
    return new Client(props);
  }

  deactivate(): void {
    if (!this.props.isActive) throw new DomainError('Client is already inactive');
    this.props.isActive = false;
  }

  updateAestheticGoals(goals: string): void {
    if (!goals?.trim()) throw new ValidationError('Aesthetic goals cannot be empty');
    this.props.aestheticGoals = goals;
  }

  get id(): ClientId { return this.props.id; }
  get fullName(): string { return this.props.fullName; }
  get phone(): string { return this.props.phone; }
  get isActive(): boolean { return this.props.isActive; }
  get domainEvents(): DomainEvent[] { return [...this._domainEvents]; }
  
  clearDomainEvents(): void { this._domainEvents.length = 0; }
}
```

### Use Case (exemplo)

```typescript
// packages/application/use-cases/session/CreateSessionUseCase.ts
// @dev-lead — Use case isolado, testável, sem framework

export interface CreateSessionInput {
  idempotencyKey: string;
  clinicId: string;
  clientId: string;
  professionalId: string;
  sessionDate: Date;
  preSessionNotes?: string;
  clientComplaint?: string;
}

export interface CreateSessionOutput {
  sessionId: string;
  sessionNumber: number;
}

export class CreateSessionUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly clientRepository: IClientRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(input: CreateSessionInput): Promise<CreateSessionOutput> {
    // Idempotência
    const existing = await this.sessionRepository.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { sessionId: existing.id.value, sessionNumber: existing.sessionNumber };

    // Validação de negócio
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) throw new NotFoundError('Client not found');
    if (!client.isActive) throw new DomainError('Cannot create session for inactive client');

    // Criação
    const session = Session.create({
      clinicId: input.clinicId,
      clientId: input.clientId,
      professionalId: input.professionalId,
      sessionDate: input.sessionDate,
      idempotencyKey: input.idempotencyKey,
      preSessionNotes: input.preSessionNotes,
      clientComplaint: input.clientComplaint,
    });

    await this.sessionRepository.save(session);
    await this.eventBus.publish(session.domainEvents);
    session.clearDomainEvents();

    return { sessionId: session.id.value, sessionNumber: session.sessionNumber };
  }
}
```

### Repository Interface (exemplo)

```typescript
// packages/domain/repositories/ISessionRepository.ts

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findByIdempotencyKey(key: string): Promise<Session | null>;
  findByClientId(clientId: string, options?: PaginationOptions): Promise<Session[]>;
  save(session: Session): Promise<void>;
  update(session: Session): Promise<void>;
  delete(sessionId: string): Promise<void>;
}
```

---

## 🔐 VARIÁVEIS DE AMBIENTE

> **Instrução para @devops:** Todas as variáveis abaixo devem ser configuradas no painel do Vercel em **Settings → Environment Variables**, separadas por escopo (Production, Preview, Development). Nunca commitar valores reais no repositório.

```env
# .env.example — referência para @devops configurar no Vercel Dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Apenas em Server-side / Vercel Functions

# IA
ANTHROPIC_API_KEY=

# Mensageria
EVOLUTION_API_URL=                  # WhatsApp via Evolution API
EVOLUTION_API_KEY=
RESEND_API_KEY=                     # E-mail

# Redis / Filas (Upstash — integração nativa com Vercel)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_URL=                         # Upstash QStash para jobs assíncronos
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Monitoramento
SENTRY_DSN=
SENTRY_AUTH_TOKEN=                  # Para source maps no build
NEXT_PUBLIC_SENTRY_DSN=

# Storage
SUPABASE_STORAGE_BUCKET_PHOTOS=aesthetic-photos

# App
NEXT_PUBLIC_APP_URL=                # https://aesthetictrack.vercel.app (ou domínio customizado)

# Vercel (automáticas — não precisa configurar manualmente)
# VERCEL_URL, VERCEL_ENV, VERCEL_GIT_COMMIT_SHA
```

**Configuração de ambientes no Vercel:**
```
Production  → branch: main       → domínio customizado + todas as vars de prod
Preview     → branch: qualquer   → vars de staging (Supabase project separado)
Development → local               → .env.local (nunca commitar)
```

---

## 🚀 COMANDOS DE DESENVOLVIMENTO

```bash
# Setup inicial
pnpm install
vercel link                        # Conectar projeto ao Vercel
vercel env pull .env.local         # Baixar envs de desenvolvimento do Vercel
pnpm supabase start                # Supabase local
pnpm supabase db push              # Aplicar migrations
pnpm supabase db seed              # Dados de teste

# Desenvolvimento
pnpm dev                           # Next.js + todos os packages (Turborepo)
vercel dev                         # Simula ambiente Vercel localmente (Edge, Functions, Crons)

# Testes (@qa)
pnpm test                          # Todos os testes
pnpm test:unit                     # Testes unitários
pnpm test:integration              # Testes de integração
pnpm test:e2e                      # Playwright (requer app rodando)
pnpm test:e2e:preview              # Playwright contra Vercel Preview URL
pnpm test:coverage                 # Relatório de cobertura (mín. 80% no domain)

# Build e Deploy
pnpm build                         # Build local (Turborepo)
vercel build                       # Simula build da Vercel localmente
vercel --prod                      # Deploy manual para produção (usar com cautela)
# Deploy normal: push para main → Vercel detecta → deploy automático

# Supabase Migrations (produção)
pnpm supabase db push --linked     # Aplica migrations no Supabase remoto
pnpm supabase migration new <name> # Cria nova migration

# Qualidade
pnpm lint
pnpm type-check
pnpm format
```

**`vercel.json` — configuração obrigatória na raiz de `apps/web`:**
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm build --filter=web",
  "functions": {
    "app/api/v1/ai/**": { "maxDuration": 60 },
    "app/api/v1/photos/**": { "maxDuration": 30 },
    "app/api/v1/**": { "maxDuration": 15 },
    "app/api/webhooks/**": { "maxDuration": 10 }
  },
  "crons": [
    {
      "path": "/api/cron/send-follow-ups",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/generate-weekly-reports",
      "schedule": "0 8 * * 1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

---

## 📋 CONVENÇÕES DE GIT

```
feat(sessions): add idempotent session creation use case
feat(ai): implement post-session message generation with Claude API
feat(photos): add before/after photo comparison slider
fix(rls): correct clinic isolation policy for session_photos
refactor(domain): extract TreatmentArea to value object
test(sessions): add coverage for CreateSessionUseCase edge cases
chore(deps): update supabase-js to v2.45
docs(architecture): add ADR for async message queue decision
ci(github-actions): add e2e tests stage to pipeline
```

---

## ⚠️ REGRAS INEGOCIÁVEIS

1. **NUNCA** acesse `auth.users` diretamente — use `aesthetic.professionals`
2. **NUNCA** exponha a `service_role_key` no frontend
3. **NUNCA** salve fotos de clientes sem verificar `is_consent_ok = true`
4. **NUNCA** envie mensagens para clientes com `communication_opt_in = false`
5. **NUNCA** escreva lógica de negócio em controllers, routes ou handlers
6. **NUNCA** importe do `infrastructure` dentro do `domain` ou `application`
7. **SEMPRE** use idempotency keys em operações de escrita e filas
8. **SEMPRE** anonimize/criptografe dados sensíveis (CPF, dados de saúde) em logs
9. **SEMPRE** valide conteúdo gerado por IA antes de enviar à cliente
10. **SEMPRE** escreva o teste antes de considerar uma feature completa

---

## 🗺️ ORDEM DE IMPLEMENTAÇÃO SUGERIDA

**Sprint 1 — Fundação**
1. `@devops` → Setup monorepo (Turborepo), Vercel project + Git integration, Supabase project
2. `@devops` → Configurar Environment Variables no Vercel (prod + preview + dev)
3. `@devops` → Executar todas as migrations SQL no Supabase
4. `@devops` → Configurar `vercel.json` com funções, crons e headers de segurança
5. `@dev-lead` → Implementar domain entities (Client, Session, Procedure, Photo)
6. `@dev-lead` → Implementar interfaces de repositório
7. `@qa` → Setup de testes, mocks e infraestrutura de teste

**Sprint 2 — Core Backend**
6. `@dev-backend` → Implementar Supabase repositories concretos
7. `@dev-backend` → Implementar use cases de Client e Session
8. `@dev-backend` → Configurar Supabase Auth + RLS
9. `@dev-backend` → Route Handlers versionados em `app/api/v1/` (Vercel Functions)
10. `@devops` → Configurar GitHub Actions (lint, test, type-check) integrado ao Vercel CI
11. `@qa` → Testes unitários e de integração do core

**Sprint 3 — Frontend Core**
11. `@dev-frontend` → Design system e componentes base
12. `@dev-frontend` → Telas de login, dashboard, listagem de clientes
13. `@dev-frontend` → Formulário de nova sessão com procedimentos dinâmicos
14. `@dev-frontend` → Upload e galeria de fotos

**Sprint 4 — Feature Disruptiva (AestheticAI)**
15. `@ai-feature` → Integração Claude API + BullMQ
16. `@ai-feature` → Job de geração de mensagem pós-sessão
17. `@ai-feature` → Integração Evolution API (WhatsApp) + Resend (e-mail)
18. `@dev-frontend` → UI de revisão e aprovação de mensagem gerada
19. `@qa` → Testes de ponta a ponta do fluxo de mensagem

**Sprint 5 — Comparador Fotográfico e Relatórios**
20. `@dev-frontend` → Slider interativo antes/depois
21. `@dev-frontend` → Timeline visual de evolução
22. `@dev-frontend` → Dashboard com métricas e relatórios
23. `@dev-frontend` → Geração de relatório antes/depois para impressão/PDF
24. `@devops` → Performance, caching, otimização de imagens

**Sprint 6 — Polimento e Produção**
25. `@qa` → Testes E2E completos com Playwright contra Vercel Preview URL
26. `@devops` → Sentry + Vercel Analytics + Speed Insights em produção
27. `@devops` → Configurar domínio customizado no Vercel + SSL automático
28. `@devops` → Configurar Vercel Edge Config para feature flags
29. `@devops` → Documentar runbooks de operação e rollback (via Vercel Deployments)
30. `@dev-frontend` → PWA manifest, push notifications, modo offline
31. `@dev-lead` → Code review final, audit de segurança, checklist de LGPD