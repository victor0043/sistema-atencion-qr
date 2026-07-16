-- Migración: agregar columna 'direccion' a la tabla 'pacientes'
-- Se usa ALTER TABLE ... IF NOT EXISTS para ser idempotente
BEGIN;
ALTER TABLE pacientes
  ADD COLUMN IF NOT EXISTS direccion TEXT;
COMMIT;
