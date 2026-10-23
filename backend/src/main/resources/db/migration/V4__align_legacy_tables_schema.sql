-- V4__align_legacy_tables_schema.sql: Align legacy production tables with JPA entity mappings
-- Completely idempotent and safe to apply on live Neon DB and local databases.

-- 1. users table columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. complaint_comments table
ALTER TABLE complaint_comments ADD COLUMN IF NOT EXISTS author_avatar TEXT;

-- 3. notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_id VARCHAR(100);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- 4. complaints table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_date TIMESTAMPTZ;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS worker_notes TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS delay_reason VARCHAR(255);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS delay_notes TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_suggested_category VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_confidence DOUBLE PRECISION;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_status VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_ai_category_accepted BOOLEAN;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS master_complaint_id VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS possible_duplicate_id VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS duplicate_similarity_score DOUBLE PRECISION;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_duplicate_confirmed BOOLEAN;

-- 5. system_activities table
ALTER TABLE system_activities ADD COLUMN IF NOT EXISTS module VARCHAR(100);
UPDATE system_activities SET module = 'SYSTEM' WHERE module IS NULL OR trim(module) = '';
