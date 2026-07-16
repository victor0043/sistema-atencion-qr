-- Migration: Normalize RUTs, remove safe duplicates, add unique constraints
-- WARNING: Review the candidate duplicates table before running in production.

BEGIN;

-- 1) Normalize `rut` removing dots, dashes and spaces
UPDATE usuarios
SET rut = regexp_replace(rut, '[.\-\s]', '', 'g')
WHERE rut IS NOT NULL;

-- 2) Build a helper table with duplicate groups for manual review
DROP TABLE IF EXISTS dedup_candidates;
CREATE TABLE dedup_candidates AS
SELECT rut, array_agg(id ORDER BY id) AS ids, count(*) AS cnt
FROM usuarios
GROUP BY rut
HAVING count(*) > 1;

-- 3) Delete duplicate usuario rows that have NO dependent medicos or administrativos
-- Keep the lowest id for each rut (ids[1]) and delete others only if they have no related rows
DELETE FROM usuarios u
USING dedup_candidates d
WHERE u.rut = d.rut
  AND u.id <> d.ids[1]
  AND NOT EXISTS (SELECT 1 FROM medicos m WHERE m.usuario_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM administrativos a WHERE a.usuario_id = u.id);

-- 4) (Optional) Report remaining duplicates for manual resolution
-- SELECT * FROM dedup_candidates; -- run manually to inspect

-- 5) Add unique constraints (will fail if duplicates remain)
ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rut_key UNIQUE (rut);

ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);

COMMIT;

-- NOTE:
-- - This script deletes duplicate users only when the duplicate rows have no related
--   records in `medicos` or `administrativos`. If duplicates have dependencies, they
--   are left in place for manual resolution.
-- - Before running in production: BACKUP the database, inspect `dedup_candidates`, and
--   adjust deletion/merge logic if you need to preserve or merge related profiles.
