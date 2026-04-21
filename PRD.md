# AestheticTrack — PRD e Mapa do Projeto

> Documento de referência catalogando **o que é cada pedaço do código e por que existe**. Mantido próximo ao CLAUDE.md (que define a arquitetura alvo); este aqui descreve a realidade implementada.

**Data do snapshot:** 2026-04-21
**Branch:** main
**Stack resumida:** Next.js 14 App Router · Supabase (Auth + Postgres + Storage) · Tailwind + shadcn/ui · TanStack Query + Zustand · FLW/Aios Chat API (WhatsApp) · Anthropic Claude · Turborepo + pnpm

---

## 1. Visão de Produto

AestheticTrack é um sistema **single-clinic** (uma instalação = uma clínica) para acompanhamento evolutivo de clientes de clínica de estética facial/corporal.

**Jobs-to-be-done**
1. Cadastrar clientes com anamnese completa.
2. Registrar sessões com procedimentos técnicos detalhados (Botox, preenchimento, Ultraformer, skinbooster, etc.).
3. Armazenar fotos evolutivas com comparação antes/depois.
4. Disparar mensagens automáticas/manuais no WhatsApp (lembretes de agendamento, pós-sessão, follow-up).
5. Hierarquizar equipe com auditoria — dono, administradores e profissionais.

**Fora de escopo neste ciclo:** multi-clínica (tenant isolation só no nível de dados), app mobile nativo (React Native previsto no CLAUDE.md mas não iniciado), integração com Evolution API e e-mail (abandonadas; apenas FLW/Aios Chat).

---

## 2. Decisões-chave implementadas (que divergem do CLAUDE.md)

| Área | Plano (CLAUDE.md) | Implementado | Motivo |
|---|---|---|---|
| Schemas Postgres | `aesthetic.*` + `audit.*` | Tudo em `public` | Single-clinic não precisa de isolamento por schema |
| Mensageria | Evolution API + Resend | **Apenas FLW/Aios Chat** (WhatsApp) | Decisão do usuário registrada em memória |
| Roles | `aesthetician / doctor / admin` livre | **`owner / admin / professional`** com `CHECK` | Simplificação + gating de mensagens |
| Auditoria | Manual em handlers | **Triggers Postgres** em tabelas sensíveis | Imposição no banco, não contornável |
| Acesso após signup | Auto-liga usuário como `admin` | Signup em clínica existente é **bloqueado** — só via convite | Segurança |
| Magic link | Previsto como opção | **Obrigatório** para convidados (primeira entrada) | Fluxo de senha definida pelo próprio usuário |

---

## 3. Mapa do Monorepo

```
Project - Antes e Depois/
├── apps/
│   └── web/                     ← app Next.js (único deploy hoje)
├── packages/
│   ├── domain/                  ← entidades + interfaces de repositório (camada pura)
│   ├── application/             ← use cases + DTOs + ports (camada de aplicação)
│   ├── infrastructure/          ← adapters concretos (Supabase, FLW, Claude)
│   └── shared/                  ← tipos/constantes/utils compartilhados
├── supabase/
│   └── migrations/              ← SQL versionado aplicado no Supabase remoto
├── claude.MD                    ← arquitetura alvo + sub-agentes (contrato)
├── PRD.md                       ← este arquivo (estado real)
├── DEPLOY-GUIDE.md              ← passo a passo para clonar em nova clínica
├── FLWCHAT_SKILL_Clinica.md     ← notas de integração FLW Chat
├── turbo.json                   ← pipeline Turborepo (build/dev/lint)
├── pnpm-workspace.yaml          ← define apps/* e packages/*
└── package.json                 ← scripts raiz
```

### 3.1 `apps/web/` — frontend + backend (Next.js 14 App Router)

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx           ← wrapper sem chrome (sem sidebar/header)
│   │   └── login/page.tsx       ← tela única: login + signup (toggle)
│   │
│   ├── (dashboard)/             ← todas as rotas com sidebar+header
│   │   ├── layout.tsx           ← Sidebar + Header + <main>
│   │   ├── dashboard/page.tsx   ← home com KPIs da clínica
│   │   ├── clients/
│   │   │   ├── page.tsx         ← lista + busca
│   │   │   └── [id]/page.tsx    ← detalhe: anamnese, sessões, galeria, timeline
│   │   ├── sessions/page.tsx    ← agenda e registro de sessões
│   │   ├── reminders/page.tsx   ← lista e disparo de lembretes (gating por role)
│   │   ├── reports/page.tsx     ← relatórios evolutivos
│   │   ├── settings/page.tsx    ← config clínica + integrações + templates
│   │   └── team/page.tsx        ← gestão de equipe (convite, role, ativação)
│   │
│   ├── onboarding/
│   │   ├── layout.tsx           ← wrapper centralizado
│   │   ├── page.tsx             ← criação da clínica (1ª vez, vira owner)
│   │   └── set-password/page.tsx← convidado define senha após magic link
│   │
│   ├── auth/
│   │   └── callback/route.ts    ← troca code→session; roteia para set-password se pendente
│   │
│   └── api/
│       ├── health/route.ts      ← liveness probe
│       └── v1/                  ← todas as rotas versionadas aqui
│           ├── setup/           ← POST: cria clínica + owner (só 1ª vez)
│           ├── me/
│           │   ├── route.ts         ← GET: usuário auth
│           │   ├── profile/route.ts ← GET: user + professional + clinic
│           │   └── password-set/    ← POST: marca password_set_at
│           ├── clients/
│           │   ├── route.ts         ← GET lista, POST cria
│           │   └── [id]/
│           │       ├── route.ts     ← GET/PATCH/DELETE
│           │       ├── sessions/    ← sessões do cliente
│           │       ├── photos/      ← fotos do cliente
│           │       └── evolution/   ← timeline evolutiva
│           ├── sessions/
│           │   ├── route.ts         ← GET/POST
│           │   └── [id]/
│           │       ├── route.ts     ← GET/PATCH
│           │       ├── status/      ← mudar status
│           │       ├── procedures/  ← adicionar procedimentos
│           │       └── complete/    ← fechar sessão
│           ├── photos/upload/       ← upload para Supabase Storage
│           ├── settings/            ← settings da clínica (FLW token etc.)
│           ├── integrations/
│           │   ├── channels/        ← listar números FLW
│           │   ├── templates/       ← listar templates aprovados
│           │   └── test/            ← envio de teste
│           ├── messages/
│           │   ├── send/            ← POST: dispara mensagem (OWNER/ADMIN)
│           │   └── sync-crm/        ← sincroniza com CRM do FLW
│           ├── reminders/
│           │   ├── route.ts         ← GET: lista (com status derivado)
│           │   └── send/            ← POST: disparo em lote (OWNER/ADMIN)
│           ├── team/
│           │   ├── route.ts         ← GET lista, POST convida (OWNER/ADMIN)
│           │   └── [id]/route.ts    ← PATCH role/ativação, DELETE (OWNER)
│           └── ai/
│               └── post-session/    ← geração de mensagem pós-sessão via Claude
│
├── components/
│   ├── ui/                      ← shadcn: button, card, dialog, select, etc.
│   ├── shared/
│   │   ├── sidebar.tsx          ← nav principal (Dashboard, Clientes, Sessões, Lembretes, Relatórios, Equipe, Config)
│   │   └── header.tsx           ← barra topo com profile dropdown
│   └── features/                ← componentes compostos por feature
│       ├── auth/login-form.tsx
│       ├── clients/
│       ├── sessions/
│       ├── photo-comparator/    ← slider antes/depois
│       └── evolution-timeline/
│
├── lib/
│   ├── api-helpers.ts           ← getAuthenticatedUser, ensureClinicSetup, error/successResponse
│   ├── utils.ts                 ← cn() e helpers genéricos
│   ├── auth/
│   │   └── require-role.ts      ← getAuthContext, requireRole, hasRole
│   ├── supabase/
│   │   ├── client.ts            ← client-side (browser)
│   │   └── server.ts            ← server-side com cookies
│   └── hooks/                   ← TanStack Query hooks por domínio
│       ├── use-profile.ts       ← user + professional + clinic
│       ├── use-clients.ts
│       ├── use-sessions.ts
│       ├── use-reminders.ts
│       └── use-settings.ts
│
├── middleware.ts                ← guarda rotas: redireciona para /login se não autenticado
├── next.config.js
├── tailwind.config.ts
├── vercel.json                  ← timeouts por rota, crons, headers de segurança
└── package.json
```

### 3.2 `packages/domain/` — camada pura (TypeScript, sem framework)

**Papel:** entidades ricas com comportamento e interfaces de repositório. Não importa nada de framework, banco ou HTTP.

```
domain/src/
├── entities/              ← Client, Session, Procedure, Photo, TreatmentArea
├── value-objects/         ← ClientId, SessionDate, ProcedureType, PhotoComparison
├── repositories/          ← interfaces (IClientRepository, ISessionRepository, ...)
├── events/                ← DomainEvent types (SessionCreated, PhotoUploaded, ...)
└── errors/                ← DomainError, ValidationError, NotFoundError
```

**Status:** estrutura criada, uso inicial. A maioria das rotas de API ainda vai **direto no Supabase** sem passar pelos use cases/entidades. O refactor para DDD puro é um roadmap futuro — não bloqueia o produto.

### 3.3 `packages/application/` — use cases

```
application/src/
├── use-cases/             ← CreateClientUseCase, CreateSessionUseCase, ...
├── dtos/                  ← CreateClientDTO, CreateSessionDTO, ...
└── ports/                 ← IEventBus, IMessageService, IAIService, IStorageService
```

**Status:** mesma observação — existe mas está subutilizado. Fluxos simples (CRUD de cliente, criar sessão) vão direto; fluxos complexos (mensagem pós-sessão com IA) eventualmente passarão por aqui.

### 3.4 `packages/infrastructure/` — adapters concretos

```
infrastructure/src/
├── database/
│   └── supabase-client.ts       ← getSupabaseAdminClient (service_role) + getSupabaseClient (anon)
├── repositories/
│   ├── SupabaseClientRepository.ts
│   ├── SupabaseSessionRepository.ts
│   ├── SupabasePhotoRepository.ts
│   └── SupabaseProcedureRepository.ts
├── services/
│   ├── FlwChatService.ts        ← ATIVO: WhatsApp via FLW/Aios Chat API
│   ├── AiosMessageService.ts    ← wrapper antigo; depreciado
│   ├── EvolutionAPIMessageService.ts  ← não utilizado
│   ├── ResendEmailService.ts    ← não utilizado
│   ├── ClaudeAIService.ts       ← geração de mensagens pós-sessão
│   ├── SupabaseStorageService.ts← upload de fotos
│   └── UpstashEventBus.ts       ← fila assíncrona (preparado, pouco usado)
├── jobs/                         ← jobs assíncronos (preparado)
└── index.ts                      ← re-exports públicos
```

**Nuance importante:** `getSupabaseAdminClient()` é um singleton com `service_role_key` que **contorna RLS**. Usado em todas as rotas de API. Isso significa que **as policies de RLS não protegem a aplicação** — a segurança vem do código da API (`requireRole`, `ensureClinicSetup`). RLS só protege acesso via SDK anon do navegador, que o app quase não usa.

### 3.5 `packages/shared/` — utilitários

```
shared/src/
├── types/                 ← tipos comuns (Result<T,E>, PaginationOptions)
├── constants/             ← constantes compartilhadas
└── utils/                 ← helpers genéricos
```

### 3.6 `supabase/migrations/` — SQL versionado

Aplicado manualmente via Supabase SQL Editor. A ordem importa.

| Arquivo | O que faz |
|---|---|
| `00001_full_schema.sql` | Schema inicial em `aesthetic.*` + `audit.*` (histórico — não é mais a forma viva do banco) |
| `00002_move_to_public_schema.sql` | Dropa schemas customizados e recria **tudo em `public`**. É este o schema atual. |
| `00003_roles_invites_audit.sql` | Hierarquia `owner/admin/professional` + colunas de convite + triggers de auditoria |

**Cuidado:** se for clonar do zero numa nova instalação, execute na ordem 002 → 003 (o 001 é histórico, redundante após o 002).

---

## 4. Modelos de dados essenciais (public schema)

Resumo; definições completas estão nas migrations.

| Tabela | Papel | Chaves de negócio |
|---|---|---|
| `clinics` | Dados da clínica (1 linha no modelo single-clinic) | `settings JSONB` guarda tokens FLW, preferências de lembrete |
| `professionals` | Funcionários da clínica; liga `auth.users` ↔ clínica | `role` (CHECK owner/admin/professional), `invited_at`, `password_set_at`, `is_active` |
| `clients` | Pacientes/clientes da clínica | anamnese completa (skin_type, fitzpatrick, allergies, medications...), `communication_opt_in` |
| `sessions` | Sessões de atendimento | `session_number` auto-incrementado por cliente, `status` (scheduled/completed/etc), `idempotency_key` |
| `session_procedures` | Procedimentos executados na sessão | `technical_details JSONB` flexível por categoria |
| `session_photos` | Fotos da sessão | `photo_type` (before/after/during/progress), `angle`, `is_consent_ok` |
| `photo_comparisons` | Comparativos curados antes/depois | `is_shareable` = se cliente pode ver |
| `products` | Catálogo de insumos (Botox Allergan, Juvederm, ...) | `cost_per_unit` para relatórios |
| `message_templates` | Templates de mensagem | `is_ai_enhanced` marca se passa pela IA |
| `client_messages` | Mensagens disparadas | `idempotency_key` previne duplicatas; `external_message_id` do FLW |
| `ai_generation_log` | Log de consumo da Claude API | prompt/completion tokens, custo |
| `activity_log` | **Auditoria** — toda escrita em tabelas sensíveis | preenchida automaticamente pelos triggers da migration 003 |

### Views e funções
- `client_evolution_summary` — view com métricas consolidadas por cliente
- `search_clients(clinic_id, query, limit, offset)` — busca full-text tolerante a acentos

---

## 5. Fluxos críticos passo a passo

### 5.1 Primeiro acesso (criação da clínica)

```
/login → signup → /dashboard (sem clínica) → redireciona p/ /onboarding
/onboarding (form clinicName + professionalName)
  ↓ POST /api/v1/setup
clinics.insert + professionals.insert(role='owner', password_set_at=now())
  ↓
redirect /dashboard
```

**Nota:** hoje o redirect signup → /onboarding depende do dashboard detectar a ausência de `professional` (gap conhecido — documentado no PRD anterior).

### 5.2 Convite de novo profissional

```
Admin/Owner em /dashboard/team clica "Convidar"
  ↓ POST /api/v1/team { fullName, email, role, specialty }
requireRole(['owner','admin']) + role=='admin' exige callerRole=='owner'
  ↓
supabase.auth.admin.inviteUserByEmail(email, { redirectTo: /auth/callback?next=/onboarding/set-password })
  ├─► cria auth.users (sem senha)
  └─► envia magic link (template Supabase Invite User)
  ↓
professionals.insert({ user_id, clinic_id, role, invited_at, password_set_at: null })
```

### 5.3 Primeira entrada do convidado

```
Convidado clica link no e-mail
  ↓ chega em /auth/callback?code=...
exchangeCodeForSession → sessão criada
  ↓ callback lê professionals.password_set_at
password_set_at IS NULL → redirect /onboarding/set-password
  ↓
usuário digita senha → supabase.auth.updateUser({ password })
  ↓ POST /api/v1/me/password-set
professionals.password_set_at = now()
  ↓
redirect /dashboard
```

### 5.4 Disparo de lembrete (gated)

```
/dashboard/reminders (qualquer role vê a lista)
  ├─ role='professional' → banner "apenas admins podem disparar", botões escondidos
  └─ role='owner' ou 'admin' → botões visíveis
     ↓ POST /api/v1/reminders/send
     requireRole(['owner','admin']) → 403 se não for
     ↓
     Para cada target: FlwChatService.sendMessage + insert em client_messages
```

### 5.5 Auditoria (automática)

Toda vez que um `INSERT/UPDATE/DELETE` acontece em `clients`, `sessions`, `session_photos`, `client_messages` ou `professionals`:

```
Trigger → log_activity() → INSERT activity_log(
  clinic_id, user_id=auth.uid(), action=TG_OP,
  resource_type=TG_TABLE_NAME, resource_id, changes=jsonb(before,after)
)
```

**Atenção:** quando a rota de API usa `getSupabaseAdminClient()` (service_role), `auth.uid()` retorna NULL — o registro de auditoria fica **sem usuário identificado**. Para capturar o usuário real, teríamos que:
- (a) registrar manualmente via handler após a escrita, OU
- (b) usar o cliente autenticado (anon key com JWT do user) em vez do admin em operações não-privilegiadas.

Esta é uma limitação conhecida. Para este ciclo, aceita-se — as ações passam pelo handler, então `console.log` ou Sentry podem preencher o gap se necessário.

---

## 6. Sistema de roles (resumo operacional)

| Papel | Ver tudo | Editar clientes/sessões/fotos | Disparar mensagem | Convidar | Gerenciar equipe |
|---|:---:|:---:|:---:|:---:|:---:|
| `owner` | ✅ | ✅ | ✅ | ✅ (qualquer role) | ✅ tudo |
| `admin` | ✅ | ✅ | ✅ | ✅ (só professional) | ✅ desativar, não muda role |
| `professional` | ✅ | ✅ | ❌ | ❌ | ❌ |

**Garantias de banco:**
- `CHECK (role IN ('owner','admin','professional'))` — impede valores inválidos.
- `UNIQUE INDEX ... WHERE role = 'owner'` — no máximo 1 owner por clínica.

**Garantias de API:** `lib/auth/require-role.ts` → `requireRole([...])` retorna 403 se não bate.

**Garantias de UI:** `useProfile().professional.role` controla visibilidade — mas é apenas UX; a defesa real está na API.

---

## 7. Integrações externas

| Serviço | Uso atual | Onde | Credencial |
|---|---|---|---|
| **Supabase Auth** | login, signup, magic link | `lib/supabase/*`, `inviteUserByEmail` | `NEXT_PUBLIC_SUPABASE_URL` + anon + service_role |
| **Supabase Postgres** | banco principal | mesmos clients | mesma |
| **Supabase Storage** | fotos de clientes | `SupabaseStorageService` | mesma |
| **FLW/Aios Chat API** | WhatsApp outbound | `FlwChatService` em `packages/infrastructure` | token em `clinics.settings.flwApiToken` |
| **Anthropic Claude** | geração de mensagens pós-sessão | `ClaudeAIService`, rota `/api/v1/ai/post-session` | `ANTHROPIC_API_KEY` |
| **Vercel** | hosting + cron jobs | `vercel.json` define timeouts e `crons` | — |

**Não utilizados (código presente mas dormente):** Evolution API, Resend (e-mail), Upstash QStash.

---

## 8. Variáveis de ambiente (runtime)

Configuradas em **Vercel → Settings → Environment Variables** (Prod/Preview/Dev). `.env.local` para dev.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY          (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
SUPABASE_SERVICE_ROLE_KEY              (ou SUPABASE_SECRET_KEY)
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL                    (usado no redirectTo do inviteUserByEmail)
```

Tokens de FLW **não** vão em env — ficam em `clinics.settings` (por-clínica, configuráveis pela UI).

---

## 9. Pontos de atenção / dívidas

1. **Gap signup → onboarding**: usuário que fecha o browser após signup volta ao `/dashboard` sem clínica. Hoje o dashboard detecta e redireciona; a rigor deveria ser no middleware.
2. **Auditoria sem `user_id` real** quando API usa service_role — ver seção 5.5.
3. **Camada de domínio subutilizada** — muitas rotas vão direto no Supabase. Não é um problema para o produto, mas diverge do CLAUDE.md.
4. **Magic link depende de SMTP do Supabase** — em trial pode falhar silenciosamente. Falta botão "reenviar convite" + fallback para copiar o `action_link` manualmente.
5. **RLS presente mas não é a barreira real** — service_role bypassa tudo. Se no futuro operações passarem a usar o cliente anon (ex: navegador chamando Supabase direto), revisar policies.
6. **Sem testes automatizados**: CLAUDE.md prevê Jest/Vitest/Playwright; não há suíte rodando hoje.
7. **`packages/application` e `packages/domain`** têm esqueleto mas a maioria dos use cases é inline nas route handlers.
8. **Sentry / observabilidade não integrados** — hooks de validação Vercel vêm alertando; é um próximo passo.

---

## 10. Glossário

- **Clínica (single-clinic)**: há apenas uma linha em `clinics`. O sistema é mono-tenant por instalação.
- **Professional**: funcionário com acesso (não é a cliente/paciente). Linha em `professionals` vinculada a `auth.users`.
- **Client**: cliente/paciente da clínica (linha em `clients`, não tem acesso ao sistema).
- **Sessão**: um atendimento. Contém N procedimentos e fotos.
- **Procedimento**: aplicação específica dentro da sessão (ex: Botox na testa com 10U).
- **Owner / Admin / Professional**: hierarquia de acesso (seção 6).
- **Magic link**: URL de uso único enviada por e-mail que autentica o usuário — mecanismo do convite.
- **Idempotency key**: chave em operações de escrita (sessions, client_messages) que previne duplicatas ao retentar.
- **FLW/Aios Chat**: provedor de WhatsApp API usado para outbound — único canal de mensageria ativo.

---

## 11. Como este documento é mantido

- **CLAUDE.md**: fonte de verdade do *plano* arquitetural. Define os sub-agentes e o alvo.
- **PRD.md (este arquivo)**: fonte de verdade do *implementado*. Atualizar sempre que entregar uma feature que muda um dos fluxos da seção 5 ou o modelo de dados da seção 4.
- **DEPLOY-GUIDE.md**: passo a passo operacional para subir uma nova instalação.
- **Commits**: seguem convenção `feat(scope):`, `fix(scope):`, `refactor(scope):`, `docs:`.

---

_Última atualização: 2026-04-21 — introdução do sistema hierárquico + convite por magic link._
