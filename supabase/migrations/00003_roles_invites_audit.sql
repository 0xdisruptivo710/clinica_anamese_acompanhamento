-- ============================================================
-- MIGRATION 003: Hierarquia de roles + convite + auditoria
-- Execute no Supabase SQL Editor apos 00002.
-- ============================================================

-- 1. Normalizar valores antigos de role
UPDATE professionals
SET role = 'professional'
WHERE role IN ('aesthetician', 'doctor') OR role IS NULL;

-- Qualquer coisa que nao bata com os 3 novos vira 'professional'
UPDATE professionals
SET role = 'professional'
WHERE role NOT IN ('owner', 'admin', 'professional');

-- Primeira clinica: promover o professional mais antigo a owner, se nenhum existir
UPDATE professionals p
SET role = 'owner'
WHERE p.id = (
  SELECT id FROM professionals p2
  WHERE p2.clinic_id = p.clinic_id
    AND NOT EXISTS (
      SELECT 1 FROM professionals p3
      WHERE p3.clinic_id = p2.clinic_id AND p3.role = 'owner'
    )
  ORDER BY p2.created_at ASC
  LIMIT 1
);

-- 2. Default + CHECK constraint em role
ALTER TABLE professionals
  ALTER COLUMN role SET DEFAULT 'professional';

ALTER TABLE professionals
  DROP CONSTRAINT IF EXISTS professionals_role_check;

ALTER TABLE professionals
  ADD CONSTRAINT professionals_role_check
  CHECK (role IN ('owner', 'admin', 'professional'));

-- 3. Garantir no maximo 1 owner por clinica
CREATE UNIQUE INDEX IF NOT EXISTS idx_professionals_one_owner_per_clinic
  ON professionals(clinic_id)
  WHERE role = 'owner';

-- 4. Campos de convite
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES professionals(id),
  ADD COLUMN IF NOT EXISTS password_set_at TIMESTAMPTZ;

-- Professionals existentes: considerar senha ja definida
UPDATE professionals
SET password_set_at = created_at
WHERE password_set_at IS NULL;

-- 5. Trigger de auditoria generico
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_clinic_id UUID;
  v_resource_id UUID;
  v_changes JSONB;
BEGIN
  -- auth.uid() pode ser NULL quando rodando via service_role; tudo bem, registra NULL
  v_user_id := auth.uid();

  IF TG_OP = 'DELETE' THEN
    v_resource_id := OLD.id;
    v_clinic_id := CASE
      WHEN TG_TABLE_NAME IN ('clients','sessions','client_messages') THEN OLD.clinic_id
      ELSE NULL
    END;
    v_changes := jsonb_build_object('before', to_jsonb(OLD));
  ELSIF TG_OP = 'UPDATE' THEN
    v_resource_id := NEW.id;
    v_clinic_id := CASE
      WHEN TG_TABLE_NAME IN ('clients','sessions','client_messages') THEN NEW.clinic_id
      ELSE NULL
    END;
    v_changes := jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW));
  ELSE -- INSERT
    v_resource_id := NEW.id;
    v_clinic_id := CASE
      WHEN TG_TABLE_NAME IN ('clients','sessions','client_messages') THEN NEW.clinic_id
      ELSE NULL
    END;
    v_changes := jsonb_build_object('after', to_jsonb(NEW));
  END IF;

  INSERT INTO activity_log (clinic_id, user_id, action, resource_type, resource_id, changes)
  VALUES (v_clinic_id, v_user_id, TG_OP, TG_TABLE_NAME, v_resource_id, v_changes);

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Triggers nas tabelas sensiveis
DROP TRIGGER IF EXISTS audit_clients ON clients;
CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS audit_sessions ON sessions;
CREATE TRIGGER audit_sessions
  AFTER INSERT OR UPDATE OR DELETE ON sessions
  FOR EACH ROW EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS audit_session_photos ON session_photos;
CREATE TRIGGER audit_session_photos
  AFTER INSERT OR UPDATE OR DELETE ON session_photos
  FOR EACH ROW EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS audit_client_messages ON client_messages;
CREATE TRIGGER audit_client_messages
  AFTER INSERT OR UPDATE OR DELETE ON client_messages
  FOR EACH ROW EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS audit_professionals ON professionals;
CREATE TRIGGER audit_professionals
  AFTER INSERT OR UPDATE OR DELETE ON professionals
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ============================================================
-- FIM 003
-- ============================================================
