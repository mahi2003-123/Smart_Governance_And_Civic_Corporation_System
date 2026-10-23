-- V3__add_system_activities_module.sql: Align system_activities with SystemActivity JPA entity mapping
-- Idempotent and safe to run on both live Neon DB and clean databases.

DO $$
BEGIN
    -- If legacy column entity_type exists and module does not exist, rename it to preserve data
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'system_activities' AND column_name = 'entity_type'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'system_activities' AND column_name = 'module'
    ) THEN
        ALTER TABLE system_activities RENAME COLUMN entity_type TO module;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'system_activities' AND column_name = 'module'
    ) THEN
        ALTER TABLE system_activities ADD COLUMN module VARCHAR(100);
    END IF;
END $$;

-- Populate default module for any existing records where module might be NULL
UPDATE system_activities SET module = 'SYSTEM' WHERE module IS NULL OR trim(module) = '';
