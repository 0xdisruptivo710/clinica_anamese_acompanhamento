# Guia de Deploy — Nova Clinica AestheticTrack

Passo a passo para clonar e configurar uma nova instancia do AestheticTrack para uma clinica diferente.

---

## 1. Clonar o Repositorio

```bash
git clone https://github.com/0xdisruptivo710/clinica_anamese_acompanhamento.git nome-da-clinica
cd nome-da-clinica
```

Remova o vinculo com o repositorio original e crie um novo:

```bash
git remote remove origin
```

Crie um novo repositorio no GitHub e conecte:

```bash
git remote add origin https://github.com/SEU-USER/novo-repositorio.git
git push -u origin main
```

---

## 2. Criar Projeto no Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em **New Project**
3. Preencha: nome do projeto, senha do banco, regiao (escolha a mais proxima da clinica)
4. Aguarde a criacao (~2 minutos)

### 2.1 Criar as Tabelas do Banco de Dados

O banco de dados precisa ser criado do zero para cada nova clinica. Siga os passos:

1. No Supabase Dashboard, va em **SQL Editor**
2. Clique em **New Query**
3. Copie **TODO** o conteudo do arquivo `supabase/migrations/00002_move_to_public_schema.sql` e cole no editor
4. Clique em **Run** (ou Ctrl+Enter)
5. Aguarde a mensagem de sucesso

> **IMPORTANTE:** Execute SOMENTE o arquivo `00002_move_to_public_schema.sql`. O arquivo `00001` usa schemas separados e NAO e necessario. O `00002` ja cria tudo no schema `public` que e o que o app usa.

#### Tabelas que serao criadas

| Tabela | Descricao |
|--------|-----------|
| `clinics` | Dados da clinica (nome, CNPJ, telefone, endereco) |
| `professionals` | Profissionais/usuarios vinculados a clinica |
| `clients` | Clientes da clinica com anamnese completa |
| `sessions` | Sessoes de atendimento (data, status, notas, valor) |
| `session_procedures` | Procedimentos realizados em cada sessao |
| `session_photos` | Fotos vinculadas as sessoes (antes/depois) |
| `photo_comparisons` | Comparacoes antes/depois configuradas |
| `products` | Catalogo de produtos/insumos da clinica |
| `message_templates` | Templates de mensagens pos-sessao |
| `client_messages` | Mensagens enviadas aos clientes (WhatsApp/email) |
| `ai_generation_log` | Log de geracao de conteudo com IA |
| `activity_log` | Auditoria de acoes no sistema |

#### Verificar se as tabelas foram criadas

Apos executar o SQL, va em **Table Editor** no menu lateral. Voce deve ver todas as tabelas listadas acima. Se alguma nao aparecer, execute o SQL novamente.

#### Tipos (Enums) criados automaticamente

O SQL tambem cria os seguintes tipos que sao usados nas tabelas:

- `procedure_category` — tipos de procedimento (botox, preenchimento, laser, etc.)
- `treatment_area` — areas do rosto e corpo (testa, queixo, abdomen, etc.)
- `session_status` — status da sessao (agendada, em andamento, concluida, etc.)
- `photo_type` — tipo de foto (antes, depois, durante, progresso)
- `photo_angle` — angulo da foto (frontal, perfil esquerdo/direito, etc.)
- `message_channel` — canal de envio (whatsapp, email, sms)
- `message_status` — status da mensagem (pendente, enviada, entregue, lida)
- `skin_type` — tipo de pele (normal, seca, oleosa, mista, sensivel)
- `fitzpatrick_scale` — escala de Fitzpatrick (I a VI)

#### Funcoes e Views criadas

- `set_updated_at()` — atualiza automaticamente o campo `updated_at` em qualquer tabela
- `set_session_number()` — numera automaticamente as sessoes por cliente (1a, 2a, 3a...)
- `search_clients()` — busca de clientes por nome, telefone ou CPF
- `client_evolution_summary` — view com resumo evolutivo de cada cliente

#### Se precisar resetar o banco (CUIDADO: apaga todos os dados)

```sql
-- CUIDADO: isso apaga TUDO. Use apenas em ambiente de teste.
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS ai_generation_log CASCADE;
DROP TABLE IF EXISTS client_messages CASCADE;
DROP TABLE IF EXISTS message_templates CASCADE;
DROP TABLE IF EXISTS photo_comparisons CASCADE;
DROP TABLE IF EXISTS session_photos CASCADE;
DROP TABLE IF EXISTS session_procedures CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;

DROP TYPE IF EXISTS procedure_category CASCADE;
DROP TYPE IF EXISTS treatment_area CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS photo_type CASCADE;
DROP TYPE IF EXISTS photo_angle CASCADE;
DROP TYPE IF EXISTS message_channel CASCADE;
DROP TYPE IF EXISTS message_status CASCADE;
DROP TYPE IF EXISTS skin_type CASCADE;
DROP TYPE IF EXISTS fitzpatrick_scale CASCADE;

DROP FUNCTION IF EXISTS set_updated_at CASCADE;
DROP FUNCTION IF EXISTS set_session_number CASCADE;
DROP FUNCTION IF EXISTS search_clients CASCADE;
DROP VIEW IF EXISTS client_evolution_summary CASCADE;
```

Depois de resetar, execute o `00002_move_to_public_schema.sql` novamente.

### 2.2 Configurar Autenticacao

1. Va em **Authentication > Providers > Email**
2. Certifique-se que **Email** esta habilitado
3. **Desative "Confirm email"** (para facilitar o cadastro)
4. Salve

### 2.3 Configurar URLs de Redirect

1. Va em **Authentication > URL Configuration**
2. **Site URL**: `https://NOME-DO-PROJETO.vercel.app`
3. **Redirect URLs**: adicione `https://NOME-DO-PROJETO.vercel.app/auth/callback`
4. Salve

### 2.4 Criar Bucket de Fotos

1. Va em **Storage**
2. Clique em **New Bucket**
3. Nome: `aesthetic-photos`
4. Marque **Public bucket**
5. Crie o bucket

### 2.5 Copiar Chaves

Va em **Settings > API** e copie:

- **Project URL** → sera o `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → sera o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role secret** → sera o `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Deploy na Vercel

### 3.1 Importar Projeto

1. Acesse https://vercel.com/new
2. Clique em **Import Git Repository**
3. Selecione o repositorio que voce criou no passo 1
4. Em **Root Directory** coloque: `apps/web`
5. Framework: sera detectado como **Next.js** automaticamente
6. Clique em **Deploy** (vai falhar na primeira vez — normal, falta as env vars)

### 3.2 Configurar Variaveis de Ambiente

Na Vercel, va em **Settings > Environment Variables** e adicione:

#### Obrigatorias (app nao funciona sem)

| Variavel | Valor | Ambientes |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (ex: `https://xxxxx.supabase.co`) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave `anon` `public` do Supabase | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role` `secret` do Supabase | Production, Preview, Development |

#### Opcionais (habilitar conforme necessidade)

| Variavel | Para que serve |
|----------|---------------|
| `ANTHROPIC_API_KEY` | Mensagens pos-sessao com IA (Claude) |
| `EVOLUTION_API_URL` | URL da instancia Evolution API (WhatsApp) |
| `EVOLUTION_API_KEY` | Chave da instancia Evolution |
| `RESEND_API_KEY` | Envio de e-mail transacional |
| `NEXT_PUBLIC_APP_URL` | URL publica do app (ex: `https://clinica-xxx.vercel.app`) |
| `SUPABASE_STORAGE_BUCKET_PHOTOS` | Nome do bucket de fotos (padrao: `aesthetic-photos`) |

### 3.3 Redeploy

Apos adicionar as variaveis:

1. Va em **Deployments**
2. Encontre o ultimo deploy (que falhou)
3. Clique nos 3 pontinhos → **Redeploy**
4. Aguarde finalizar

---

## 4. Primeiro Acesso

1. Acesse a URL gerada pela Vercel (ex: `https://clinica-xxx.vercel.app`)
2. Clique em **Criar Conta**
3. Coloque o email e senha do profissional/administrador da clinica
4. Sera redirecionado para a tela de **Onboarding** para configurar o nome da clinica
5. Pronto — o sistema esta funcional

---

## 5. Personalizar para a Clinica

### 5.1 Nome e Marca

Edite o arquivo `apps/web/app/(auth)/login/page.tsx`:

```tsx
<h1 className="text-4xl font-bold tracking-tight text-primary">
  Nome da Clinica  // ← altere aqui
</h1>
<p className="mt-2 text-muted-foreground">
  Slogan da clinica  // ← altere aqui
</p>
```

### 5.2 Cores

Edite `apps/web/app/globals.css` — altere as variaveis CSS de `--primary` para mudar a cor principal:

```css
--primary: 220 90% 56%;      /* Azul padrao */
--primary: 350 80% 50%;      /* Exemplo: Rosa */
--primary: 160 60% 45%;      /* Exemplo: Verde */
```

### 5.3 Dominio Customizado

1. Na Vercel, va em **Settings > Domains**
2. Adicione o dominio da clinica (ex: `app.clinicabeleza.com.br`)
3. Configure o DNS conforme as instrucoes da Vercel (CNAME ou A record)
4. **Atualize no Supabase** o Site URL e Redirect URLs para o novo dominio

---

## 6. Checklist Final

- [ ] Repositorio clonado e conectado ao novo GitHub repo
- [ ] Projeto Supabase criado
- [ ] Migrations executadas no SQL Editor
- [ ] "Confirm email" desativado em Authentication > Providers > Email
- [ ] Site URL e Redirect URLs configurados no Supabase
- [ ] Bucket `aesthetic-photos` criado no Storage
- [ ] Projeto importado na Vercel com Root Directory = `apps/web`
- [ ] 3 variaveis obrigatorias configuradas na Vercel
- [ ] Deploy realizado com sucesso
- [ ] Primeiro usuario criado e logado
- [ ] Nome/marca da clinica personalizado (opcional)
- [ ] Dominio customizado configurado (opcional)

---

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| `500 MIDDLEWARE_INVOCATION_FAILED` | Verificar se as 3 env vars do Supabase estao configuradas na Vercel |
| `email rate limit exceeded` | Aguardar 1 hora ou configurar SMTP customizado no Supabase |
| Login redireciona para localhost | Atualizar o Site URL no Supabase para a URL da Vercel |
| Magic link nao funciona | Usar login com email + senha (ja e o padrao) |
| Dados de outra clinica aparecem | Cada clone deve ter seu PROPRIO projeto Supabase separado |
| Build falha na Vercel | Verificar se Root Directory esta como `apps/web` |
| Fotos nao carregam | Criar o bucket `aesthetic-photos` no Supabase Storage como publico |
