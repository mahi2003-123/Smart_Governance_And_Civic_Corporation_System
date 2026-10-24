-- V6__drop_secondary_tables_and_restore_complaints.sql
-- Restore columns on complaints table, drop complaint_assignments, complaint_ai_metadata, and complaint_feedback

-- 1. Ensure all columns exist on complaints table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_worker_id VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_worker_name VARCHAR(255);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_date TIMESTAMPTZ;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS worker_notes TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS delay_reason VARCHAR(255);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS delay_notes TEXT;

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_suggested_category VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_confidence DOUBLE PRECISION;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_status VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_ai_category_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS master_complaint_id VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS possible_duplicate_id VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS duplicate_similarity_score DOUBLE PRECISION;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_duplicate_confirmed BOOLEAN DEFAULT FALSE;

-- 2. Restore worker assignment data from complaint_assignments if present
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='complaint_assignments') THEN
        UPDATE complaints c
        SET assigned_worker_id = COALESCE(c.assigned_worker_id, a.assigned_worker_id),
            assigned_worker_name = COALESCE(c.assigned_worker_name, a.assigned_worker_name),
            assigned_date = COALESCE(c.assigned_date, a.assigned_date),
            due_date = COALESCE(c.due_date, a.due_date),
            worker_notes = COALESCE(c.worker_notes, a.worker_notes),
            delay_reason = COALESCE(c.delay_reason, a.delay_reason),
            delay_notes = COALESCE(c.delay_notes, a.delay_notes)
        FROM complaint_assignments a
        WHERE c.id = a.complaint_id;
    END IF;
END $$;

-- 3. Restore AI metadata from complaint_ai_metadata if present
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='complaint_ai_metadata') THEN
        UPDATE complaints c
        SET ai_suggested_category = COALESCE(c.ai_suggested_category, m.ai_suggested_category),
            ai_confidence = COALESCE(c.ai_confidence, m.ai_confidence),
            ai_model = COALESCE(c.ai_model, m.ai_model),
            ai_status = COALESCE(c.ai_status, m.ai_status),
            is_ai_category_accepted = COALESCE(c.is_ai_category_accepted, m.is_ai_category_accepted),
            master_complaint_id = COALESCE(c.master_complaint_id, m.master_complaint_id),
            possible_duplicate_id = COALESCE(c.possible_duplicate_id, m.possible_duplicate_id),
            duplicate_similarity_score = COALESCE(c.duplicate_similarity_score, m.duplicate_similarity_score),
            is_duplicate_confirmed = COALESCE(c.is_duplicate_confirmed, m.is_duplicate_confirmed)
        FROM complaint_ai_metadata m
        WHERE c.id = m.complaint_id;
    END IF;
END $$;

-- 4. Drop complaint_assignments, complaint_ai_metadata, and complaint_feedback tables
DROP TABLE IF EXISTS complaint_assignments CASCADE;
DROP TABLE IF EXISTS complaint_ai_metadata CASCADE;
DROP TABLE IF EXISTS complaint_feedback CASCADE;

-- 5. Re-add worker index on complaints table
CREATE INDEX IF NOT EXISTS idx_complaint_worker ON complaints(assigned_worker_id);
