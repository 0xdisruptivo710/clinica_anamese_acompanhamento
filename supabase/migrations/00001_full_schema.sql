-- ============================================================
-- AestheticTrack — Full Database Schema
-- Execute este arquivo no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- MIGRATION 001: Extensões e Schemas
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

CREATE SCHEMA IF NOT EXISTS aesthetic;
CREATE SCHEMA IF NOT EXISTS audit;

CREATE OR REPLACE FUNCTION aesthetic.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- MIGRATION 002: Enums
-- ============================================================
CREATE TYPE aesthetic.procedure_category AS ENUM (
  'facial_botox', 'facial_filler', 'facial_stimulator', 'facial_skinbooster',
  'facial_ultraformer', 'facial_laser', 'facial_peel', 'facial_led',
  'facial_microneedling', 'body_lipolysis', 'body_ultraformer',
  'body_radiofrequency', 'body_cavitation', 'body_lymphatic_drainage',
  'body_cryolipolysis', 'other'
);

CREATE TYPE aesthetic.treatment_area AS ENUM (
  'forehead', 'glabella', 'crow_feet', 'bunny_lines',
  'nasolabial_folds', 'marionette_lines', 'lip_upper', 'lip_lower',
  'lip_commissure', 'chin', 'jaw', 'neck', 'under_eye', 'cheekbones',
  'nose', 'temple', 'full_face',
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

-- ============================================================
-- MIGRATION 003: Clínica e Profissionais
-- ============================================================
CREATE TABLE aesthetic.clinics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  cnpj          TEXT UNIQUE,
  phone         TEXT,
  email         TEXT,
  address       JSONB,
  logo_url      TEXT,
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER aesthetic_clinics_updated_at
  BEFORE UPDATE ON aesthetic.clinics
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_updated_at();

CREATE TABLE aesthetic.professionals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id       UUID NOT NULL REFERENCES aesthetic.clinics(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  crf_crm         TEXT,
  specialty       TEXT,
  role            TEXT NOT NULL DEFAULT 'aesthetician',
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, clinic_id)
);

CREATE TRIGGER aesthetic_professionals_updated_at
  BEFORE UPDATE ON aesthetic.professionals
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_updated_at();

CREATE INDEX idx_professionals_clinic ON aesthetic.professionals(clinic_id);
CREATE INDEX idx_professionals_user ON aesthetic.professionals(user_id);

-- ============================================================
-- MIGRATION 004: Clientes
-- ============================================================
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
  skin_type           aesthetic.skin_type,
  fitzpatrick         aesthetic.fitzpatrick_scale,
  allergies           TEXT[],
  medications         TEXT[],
  medical_conditions  TEXT[],
  previous_procedures TEXT[],
  aesthetic_goals     TEXT,
  preferred_channel   aesthetic.message_channel DEFAULT 'whatsapp',
  communication_opt_in BOOLEAN DEFAULT TRUE,
  profile_photo_url   TEXT,
  notes               TEXT,
  tags                TEXT[],
  is_active           BOOLEAN DEFAULT TRUE,
  created_by          UUID REFERENCES aesthetic.professionals(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER aesthetic_clients_updated_at
  BEFORE UPDATE ON aesthetic.clients
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_updated_at();

CREATE INDEX idx_clients_clinic ON aesthetic.clients(clinic_id);
CREATE INDEX idx_clients_name ON aesthetic.clients USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_clients_phone ON aesthetic.clients(phone);
CREATE INDEX idx_clients_cpf ON aesthetic.clients(cpf);
CREATE INDEX idx_clients_tags ON aesthetic.clients USING gin(tags);

-- ============================================================
-- MIGRATION 005: Sessões
-- ============================================================
CREATE TABLE aesthetic.sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id           UUID NOT NULL REFERENCES aesthetic.clinics(id),
  client_id           UUID NOT NULL REFERENCES aesthetic.clients(id) ON DELETE CASCADE,
  professional_id     UUID NOT NULL REFERENCES aesthetic.professionals(id),
  session_number      INTEGER,
  session_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status              aesthetic.session_status DEFAULT 'scheduled',
  duration_minutes    INTEGER,
  total_value         DECIMAL(10,2),
  pre_session_notes   TEXT,
  client_complaint    TEXT,
  pain_score          SMALLINT CHECK (pain_score BETWEEN 0 AND 10),
  post_session_notes  TEXT,
  professional_notes  TEXT,
  follow_up_date      DATE,
  consent_signed      BOOLEAN DEFAULT FALSE,
  consent_signed_at   TIMESTAMPTZ,
  idempotency_key     TEXT UNIQUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER aesthetic_sessions_updated_at
  BEFORE UPDATE ON aesthetic.sessions
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_updated_at();

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

CREATE INDEX idx_sessions_client ON aesthetic.sessions(client_id);
CREATE INDEX idx_sessions_clinic ON aesthetic.sessions(clinic_id);
CREATE INDEX idx_sessions_date ON aesthetic.sessions(session_date DESC);
CREATE INDEX idx_sessions_status ON aesthetic.sessions(status);
CREATE INDEX idx_sessions_professional ON aesthetic.sessions(professional_id);

-- ============================================================
-- MIGRATION 006: Procedimentos
-- ============================================================
CREATE TABLE aesthetic.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES aesthetic.clinics(id),
  name            TEXT NOT NULL,
  brand           TEXT,
  category        aesthetic.procedure_category,
  unit            TEXT DEFAULT 'ml',
  cost_per_unit   DECIMAL(10,2),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE aesthetic.session_procedures (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID NOT NULL REFERENCES aesthetic.sessions(id) ON DELETE CASCADE,
  category          aesthetic.procedure_category NOT NULL,
  procedure_name    TEXT NOT NULL,
  treatment_areas   aesthetic.treatment_area[],
  side              TEXT,
  technical_details JSONB DEFAULT '{}',
  product_id        UUID REFERENCES aesthetic.products(id),
  quantity_used     DECIMAL(10,3),
  immediate_result  TEXT,
  complications     TEXT[],
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procedures_session ON aesthetic.session_procedures(session_id);
CREATE INDEX idx_procedures_category ON aesthetic.session_procedures(category);
CREATE INDEX idx_procedures_areas ON aesthetic.session_procedures USING gin(treatment_areas);

-- ============================================================
-- MIGRATION 007: Fotos e Galeria
-- ============================================================
CREATE TABLE aesthetic.session_photos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES aesthetic.sessions(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES aesthetic.clients(id) ON DELETE CASCADE,
  storage_path    TEXT NOT NULL,
  url             TEXT NOT NULL,
  thumbnail_url   TEXT,
  photo_type      aesthetic.photo_type NOT NULL,
  angle           aesthetic.photo_angle,
  treatment_area  aesthetic.treatment_area,
  taken_at        TIMESTAMPTZ DEFAULT NOW(),
  width_px        INTEGER,
  height_px       INTEGER,
  file_size_bytes INTEGER,
  ai_analysis     JSONB,
  ai_analyzed_at  TIMESTAMPTZ,
  caption         TEXT,
  is_featured     BOOLEAN DEFAULT FALSE,
  is_consent_ok   BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES aesthetic.professionals(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE aesthetic.photo_comparisons (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id         UUID NOT NULL REFERENCES aesthetic.clients(id),
  before_photo_id   UUID NOT NULL REFERENCES aesthetic.session_photos(id),
  after_photo_id    UUID NOT NULL REFERENCES aesthetic.session_photos(id),
  title             TEXT,
  notes             TEXT,
  is_shareable      BOOLEAN DEFAULT FALSE,
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

-- ============================================================
-- MIGRATION 008: Mensagens e IA
-- ============================================================
CREATE TABLE aesthetic.message_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES aesthetic.clinics(id),
  name            TEXT NOT NULL,
  procedure_category aesthetic.procedure_category,
  channel         aesthetic.message_channel DEFAULT 'whatsapp',
  subject         TEXT,
  body_template   TEXT NOT NULL,
  variables       TEXT[],
  is_ai_enhanced  BOOLEAN DEFAULT TRUE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE aesthetic.client_messages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id           UUID NOT NULL REFERENCES aesthetic.clinics(id),
  client_id           UUID NOT NULL REFERENCES aesthetic.clients(id),
  session_id          UUID REFERENCES aesthetic.sessions(id),
  template_id         UUID REFERENCES aesthetic.message_templates(id),
  channel             aesthetic.message_channel NOT NULL,
  status              aesthetic.message_status DEFAULT 'pending',
  subject             TEXT,
  body                TEXT NOT NULL,
  is_ai_generated     BOOLEAN DEFAULT FALSE,
  ai_prompt_version   TEXT,
  evolution_card_url  TEXT,
  scheduled_for       TIMESTAMPTZ,
  sent_at             TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  read_at             TIMESTAMPTZ,
  external_message_id TEXT,
  error_details       JSONB,
  idempotency_key     TEXT UNIQUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER aesthetic_messages_updated_at
  BEFORE UPDATE ON aesthetic.client_messages
  FOR EACH ROW EXECUTE FUNCTION aesthetic.set_updated_at();

CREATE TABLE aesthetic.ai_generation_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID REFERENCES aesthetic.sessions(id),
  message_id      UUID REFERENCES aesthetic.client_messages(id),
  model           TEXT NOT NULL,
  prompt_tokens   INTEGER,
  completion_tokens INTEGER,
  total_cost_usd  DECIMAL(10,6),
  input_data      JSONB,
  output_data     JSONB,
  duration_ms     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_client ON aesthetic.client_messages(client_id);
CREATE INDEX idx_messages_session ON aesthetic.client_messages(session_id);
CREATE INDEX idx_messages_status ON aesthetic.client_messages(status);
CREATE INDEX idx_messages_scheduled ON aesthetic.client_messages(scheduled_for);
CREATE INDEX idx_ai_log_session ON aesthetic.ai_generation_log(session_id);

-- ============================================================
-- MIGRATION 009: Auditoria
-- ============================================================
CREATE TABLE audit.activity_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id     UUID,
  user_id       UUID,
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  changes       JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_clinic ON audit.activity_log(clinic_id);
CREATE INDEX idx_audit_user ON audit.activity_log(user_id);
CREATE INDEX idx_audit_resource ON audit.activity_log(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit.activity_log(created_at DESC);

-- ============================================================
-- MIGRATION 010: Row Level Security (RLS)
-- ============================================================
ALTER TABLE aesthetic.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.session_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.session_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic.client_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION aesthetic.get_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM aesthetic.professionals
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "professionals_view_own_clinic_clients"
  ON aesthetic.clients FOR SELECT
  USING (clinic_id = aesthetic.get_user_clinic_id());

CREATE POLICY "professionals_insert_own_clinic_clients"
  ON aesthetic.clients FOR INSERT
  WITH CHECK (clinic_id = aesthetic.get_user_clinic_id());

CREATE POLICY "professionals_update_own_clinic_clients"
  ON aesthetic.clients FOR UPDATE
  USING (clinic_id = aesthetic.get_user_clinic_id());

CREATE POLICY "professionals_manage_own_clinic_sessions"
  ON aesthetic.sessions FOR ALL
  USING (clinic_id = aesthetic.get_user_clinic_id());

CREATE POLICY "professionals_manage_own_clinic_photos"
  ON aesthetic.session_photos FOR ALL
  USING (
    client_id IN (
      SELECT id FROM aesthetic.clients
      WHERE clinic_id = aesthetic.get_user_clinic_id()
    )
  );

CREATE POLICY "professionals_manage_own_clinic_messages"
  ON aesthetic.client_messages FOR ALL
  USING (clinic_id = aesthetic.get_user_clinic_id());

-- ============================================================
-- MIGRATION 011: Views e Funções Auxiliares
-- ============================================================
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

-- ============================================================
-- FIM — Schema completo criado com sucesso!
-- ============================================================
