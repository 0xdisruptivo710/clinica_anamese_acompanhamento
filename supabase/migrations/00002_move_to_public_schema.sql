-- ============================================================
-- MIGRATION 002: Move tudo para schema PUBLIC
-- Para app single-clinic, schema separado e desnecessario
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Dropar schemas customizados (cascade remove tudo dentro)
DROP SCHEMA IF EXISTS aesthetic CASCADE;
DROP SCHEMA IF EXISTS audit CASCADE;

-- 2. Extensoes (ja devem existir no public)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 3. Funcao updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Enums
DO $$ BEGIN
  CREATE TYPE procedure_category AS ENUM (
    'facial_botox', 'facial_filler', 'facial_stimulator', 'facial_skinbooster',
    'facial_ultraformer', 'facial_laser', 'facial_peel', 'facial_led',
    'facial_microneedling', 'body_lipolysis', 'body_ultraformer',
    'body_radiofrequency', 'body_cavitation', 'body_lymphatic_drainage',
    'body_cryolipolysis', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE treatment_area AS ENUM (
    'forehead', 'glabella', 'crow_feet', 'bunny_lines',
    'nasolabial_folds', 'marionette_lines', 'lip_upper', 'lip_lower',
    'lip_commissure', 'chin', 'jaw', 'neck', 'under_eye', 'cheekbones',
    'nose', 'temple', 'full_face',
    'abdomen', 'flanks', 'arms', 'inner_thighs', 'outer_thighs',
    'buttocks', 'back', 'chest', 'full_body'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM (
    'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE photo_type AS ENUM (
    'before', 'after', 'during', 'progress', 'reference'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE photo_angle AS ENUM (
    'frontal', 'left_profile', 'right_profile',
    'left_three_quarters', 'right_three_quarters', 'superior', 'inferior'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE message_channel AS ENUM ('whatsapp', 'email', 'sms');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE skin_type AS ENUM ('normal', 'dry', 'oily', 'combination', 'sensitive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fitzpatrick_scale AS ENUM ('I', 'II', 'III', 'IV', 'V', 'VI');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Tabelas

CREATE TABLE IF NOT EXISTS clinics (
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
DROP TRIGGER IF EXISTS clinics_updated_at ON clinics;
CREATE TRIGGER clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS professionals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
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
DROP TRIGGER IF EXISTS professionals_updated_at ON professionals;
CREATE TRIGGER professionals_updated_at BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_professionals_clinic ON professionals(clinic_id);
CREATE INDEX IF NOT EXISTS idx_professionals_user ON professionals(user_id);

CREATE TABLE IF NOT EXISTS clients (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL,
  date_of_birth       DATE,
  cpf                 TEXT,
  phone               TEXT NOT NULL,
  whatsapp            TEXT,
  email               TEXT,
  address             JSONB,
  skin_type           skin_type,
  fitzpatrick         fitzpatrick_scale,
  allergies           TEXT[],
  medications         TEXT[],
  medical_conditions  TEXT[],
  previous_procedures TEXT[],
  aesthetic_goals     TEXT,
  preferred_channel   message_channel DEFAULT 'whatsapp',
  communication_opt_in BOOLEAN DEFAULT TRUE,
  profile_photo_url   TEXT,
  notes               TEXT,
  tags                TEXT[],
  is_active           BOOLEAN DEFAULT TRUE,
  created_by          UUID REFERENCES professionals(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_clients_clinic ON clients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients USING gin(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON clients(cpf);
CREATE INDEX IF NOT EXISTS idx_clients_tags ON clients USING gin(tags);

CREATE TABLE IF NOT EXISTS sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id           UUID NOT NULL REFERENCES clinics(id),
  client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  professional_id     UUID NOT NULL REFERENCES professionals(id),
  session_number      INTEGER,
  session_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status              session_status DEFAULT 'scheduled',
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
DROP TRIGGER IF EXISTS sessions_updated_at ON sessions;
CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION set_session_number()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(session_number), 0) + 1
  INTO NEW.session_number
  FROM sessions
  WHERE client_id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS sessions_set_number ON sessions;
CREATE TRIGGER sessions_set_number BEFORE INSERT ON sessions FOR EACH ROW EXECUTE FUNCTION set_session_number();

CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_clinic ON sessions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_professional ON sessions(professional_id);

CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  name            TEXT NOT NULL,
  brand           TEXT,
  category        procedure_category,
  unit            TEXT DEFAULT 'ml',
  cost_per_unit   DECIMAL(10,2),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_procedures (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  category          procedure_category NOT NULL,
  procedure_name    TEXT NOT NULL,
  treatment_areas   treatment_area[],
  side              TEXT,
  technical_details JSONB DEFAULT '{}',
  product_id        UUID REFERENCES products(id),
  quantity_used     DECIMAL(10,3),
  immediate_result  TEXT,
  complications     TEXT[],
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_procedures_session ON session_procedures(session_id);
CREATE INDEX IF NOT EXISTS idx_procedures_category ON session_procedures(category);
CREATE INDEX IF NOT EXISTS idx_procedures_areas ON session_procedures USING gin(treatment_areas);

CREATE TABLE IF NOT EXISTS session_photos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  storage_path    TEXT NOT NULL,
  url             TEXT NOT NULL,
  thumbnail_url   TEXT,
  photo_type      photo_type NOT NULL,
  angle           photo_angle,
  treatment_area  treatment_area,
  taken_at        TIMESTAMPTZ DEFAULT NOW(),
  width_px        INTEGER,
  height_px       INTEGER,
  file_size_bytes INTEGER,
  ai_analysis     JSONB,
  ai_analyzed_at  TIMESTAMPTZ,
  caption         TEXT,
  is_featured     BOOLEAN DEFAULT FALSE,
  is_consent_ok   BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES professionals(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS photos_updated_at ON session_photos;
CREATE TRIGGER photos_updated_at BEFORE UPDATE ON session_photos FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_photos_session ON session_photos(session_id);
CREATE INDEX IF NOT EXISTS idx_photos_client ON session_photos(client_id);
CREATE INDEX IF NOT EXISTS idx_photos_type ON session_photos(photo_type);

CREATE TABLE IF NOT EXISTS photo_comparisons (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id         UUID NOT NULL REFERENCES clients(id),
  before_photo_id   UUID NOT NULL REFERENCES session_photos(id),
  after_photo_id    UUID NOT NULL REFERENCES session_photos(id),
  title             TEXT,
  notes             TEXT,
  is_shareable      BOOLEAN DEFAULT FALSE,
  created_by        UUID REFERENCES professionals(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comparisons_client ON photo_comparisons(client_id);

CREATE TABLE IF NOT EXISTS message_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  name            TEXT NOT NULL,
  procedure_category procedure_category,
  channel         message_channel DEFAULT 'whatsapp',
  subject         TEXT,
  body_template   TEXT NOT NULL,
  variables       TEXT[],
  is_ai_enhanced  BOOLEAN DEFAULT TRUE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_messages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id           UUID NOT NULL REFERENCES clinics(id),
  client_id           UUID NOT NULL REFERENCES clients(id),
  session_id          UUID REFERENCES sessions(id),
  template_id         UUID REFERENCES message_templates(id),
  channel             message_channel NOT NULL,
  status              message_status DEFAULT 'pending',
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
DROP TRIGGER IF EXISTS messages_updated_at ON client_messages;
CREATE TRIGGER messages_updated_at BEFORE UPDATE ON client_messages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_messages_client ON client_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON client_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON client_messages(status);

CREATE TABLE IF NOT EXISTS ai_generation_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID REFERENCES sessions(id),
  message_id      UUID REFERENCES client_messages(id),
  model           TEXT NOT NULL,
  prompt_tokens   INTEGER,
  completion_tokens INTEGER,
  total_cost_usd  DECIMAL(10,6),
  input_data      JSONB,
  output_data     JSONB,
  duration_ms     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_log_session ON ai_generation_log(session_id);

CREATE TABLE IF NOT EXISTS activity_log (
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
CREATE INDEX IF NOT EXISTS idx_audit_clinic ON activity_log(clinic_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON activity_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON activity_log(created_at DESC);

-- 6. View de evolucao
CREATE OR REPLACE VIEW client_evolution_summary AS
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
FROM clients c
LEFT JOIN sessions s ON s.client_id = c.id AND s.status = 'completed'
LEFT JOIN session_procedures sp ON sp.session_id = s.id
LEFT JOIN session_photos ph ON ph.client_id = c.id
GROUP BY c.id, c.full_name, c.clinic_id;

-- 7. Funcao de busca
CREATE OR REPLACE FUNCTION search_clients(
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
  FROM clients c
  LEFT JOIN sessions s ON s.client_id = c.id
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
-- PRONTO! Todas as tabelas agora estao no schema PUBLIC
-- ============================================================
