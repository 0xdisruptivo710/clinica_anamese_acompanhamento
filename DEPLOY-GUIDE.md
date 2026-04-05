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

### 2.1 Executar as Migrations

No Supabase Dashboard, va em **SQL Editor** e execute os arquivos na ordem:

1. Abra `supabase/migrations/00001_full_schema.sql` — copie e execute
2. Abra `supabase/migrations/00002_move_to_public_schema.sql` — copie e execute

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
