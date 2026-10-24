-- V5__drop_feedback_and_decompose_complaints.sql: Decompose complaints table & drop complaint_feedback
-- Safe, idempotent, and non-destructive for Neon DB and fresh databases.

-- 1. Create complaint_assignments table
CREATE TABLE IF NOT EXISTS complaint_assignments (
    complaint_id VARCHAR(100) PRIMARY KEY REFERENCES complaints(id) ON DELETE CASCADE,
    assigned_worker_id VARCHAR(100) REFERENCES users(id),
    assigned_worker_name VARCHAR(255),
    assigned_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    worker_notes TEXT,
    delay_reason VARCHAR(255),
    delay_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_complaint_assignments_worker ON complaint_assignments(assigned_worker_id);

-- Migrate existing worker assignment data from complaints
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'complaints' AND column_name = 'assigned_worker_id'
    ) THEN
        INSERT INTO complaint_assignments (
            complaint_id, assigned_worker_id, assigned_worker_name, assigned_date, due_date, worker_notes, delay_reason, delay_notes
        )
        SELECT 
            id, assigned_worker_id, assigned_worker_name, assigned_date, due_date, worker_notes, delay_reason, delay_notes
        FROM complaints
        ON CONFLICT (complaint_id) DO UPDATE SET
            assigned_worker_id = EXCLUDED.assigned_worker_id,
            assigned_worker_name = EXCLUDED.assigned_worker_name,
            assigned_date = EXCLUDED.assigned_date,
            due_date = EXCLUDED.due_date,
            worker_notes = EXCLUDED.worker_notes,
            delay_reason = EXCLUDED.delay_reason,
            delay_notes = EXCLUDED.delay_notes;
    END IF;
END $$;

-- 2. Create complaint_ai_metadata table
CREATE TABLE IF NOT EXISTS complaint_ai_metadata (
    complaint_id VARCHAR(100) PRIMARY KEY REFERENCES complaints(id) ON DELETE CASCADE,
    ai_suggested_category VARCHAR(100),
    ai_confidence DOUBLE PRECISION,
    ai_model VARCHAR(100),
    ai_status VARCHAR(100),
    is_ai_category_accepted BOOLEAN DEFAULT FALSE,
    master_complaint_id VARCHAR(100) REFERENCES complaints(id),
    possible_duplicate_id VARCHAR(100) REFERENCES complaints(id),
    duplicate_similarity_score DOUBLE PRECISION,
    is_duplicate_confirmed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_complaint_ai_metadata_master ON complaint_ai_metadata(master_complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_ai_metadata_possible_dup ON complaint_ai_metadata(possible_duplicate_id);

-- Migrate existing AI metadata from complaints
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'complaints' AND column_name = 'ai_suggested_category'
    ) THEN
        INSERT INTO complaint_ai_metadata (
            complaint_id, ai_suggested_category, ai_confidence, ai_model, ai_status, is_ai_category_accepted,
            master_complaint_id, possible_duplicate_id, duplicate_similarity_score, is_duplicate_confirmed
        )
        SELECT 
            id, ai_suggested_category, ai_confidence, ai_model, ai_status, is_ai_category_accepted,
            master_complaint_id, possible_duplicate_id, duplicate_similarity_score, is_duplicate_confirmed
        FROM complaints
        ON CONFLICT (complaint_id) DO UPDATE SET
            ai_suggested_category = EXCLUDED.ai_suggested_category,
            ai_confidence = EXCLUDED.ai_confidence,
            ai_model = EXCLUDED.ai_model,
            ai_status = EXCLUDED.ai_status,
            is_ai_category_accepted = EXCLUDED.is_ai_category_accepted,
            master_complaint_id = EXCLUDED.master_complaint_id,
            possible_duplicate_id = EXCLUDED.possible_duplicate_id,
            duplicate_similarity_score = EXCLUDED.duplicate_similarity_score,
            is_duplicate_confirmed = EXCLUDED.is_duplicate_confirmed;
    END IF;
END $$;

-- 3. Drop extracted columns from complaints table
ALTER TABLE complaints DROP COLUMN IF EXISTS assigned_worker_id;
ALTER TABLE complaints DROP COLUMN IF EXISTS assigned_worker_name;
ALTER TABLE complaints DROP COLUMN IF EXISTS assigned_date;
ALTER TABLE complaints DROP COLUMN IF EXISTS due_date;
ALTER TABLE complaints DROP COLUMN IF EXISTS worker_notes;
ALTER TABLE complaints DROP COLUMN IF EXISTS delay_reason;
ALTER TABLE complaints DROP COLUMN IF EXISTS delay_notes;

ALTER TABLE complaints DROP COLUMN IF EXISTS ai_suggested_category;
ALTER TABLE complaints DROP COLUMN IF EXISTS ai_confidence;
ALTER TABLE complaints DROP COLUMN IF EXISTS ai_model;
ALTER TABLE complaints DROP COLUMN IF EXISTS ai_status;
ALTER TABLE complaints DROP COLUMN IF EXISTS is_ai_category_accepted;
ALTER TABLE complaints DROP COLUMN IF EXISTS master_complaint_id;
ALTER TABLE complaints DROP COLUMN IF EXISTS possible_duplicate_id;
ALTER TABLE complaints DROP COLUMN IF EXISTS duplicate_similarity_score;
ALTER TABLE complaints DROP COLUMN IF EXISTS is_duplicate_confirmed;

-- Drop legacy columns if present
ALTER TABLE complaints DROP COLUMN IF EXISTS latitude;
ALTER TABLE complaints DROP COLUMN IF EXISTS longitude;
ALTER TABLE complaints DROP COLUMN IF EXISTS images;
ALTER TABLE complaints DROP COLUMN IF EXISTS before_image;
ALTER TABLE complaints DROP COLUMN IF EXISTS after_image;
ALTER TABLE complaints DROP COLUMN IF EXISTS completion_image;
ALTER TABLE complaints DROP COLUMN IF EXISTS delay_image;

-- 4. Drop complaint_feedback table
DROP TABLE IF EXISTS complaint_feedback CASCADE;
