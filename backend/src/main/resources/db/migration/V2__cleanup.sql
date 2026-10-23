-- V2__cleanup.sql: Schema Cleanup, Table Normalization & Enhancements
-- Idempotent and safe to run on both live Neon DB and fresh databases.

-- a) Drop unused legacy proposal_votes table
DROP TABLE IF EXISTS proposal_votes;

-- b) Clean up duplicate legacy columns in notifications
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'user_id'
    ) THEN
        UPDATE notifications 
        SET recipient_id = COALESCE(user_id, 'ALL') 
        WHERE recipient_id IS NULL;
    END IF;
END $$;

ALTER TABLE notifications DROP COLUMN IF EXISTS "read";
ALTER TABLE notifications DROP COLUMN IF EXISTS user_id;

-- c) Convert every "timestamp without time zone" column in public schema to timestamptz using AT TIME ZONE 'UTC'
DO $$
DECLARE
    cols text[];
    item text;
    tbl text;
    col text;
BEGIN
    SELECT array_agg(c.table_name || '.' || c.column_name)
    INTO cols
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.data_type = 'timestamp without time zone'
      AND c.table_name NOT LIKE 'pg_%'
      AND c.table_name NOT LIKE 'flyway_%';

    IF cols IS NOT NULL THEN
        FOREACH item IN ARRAY cols
        LOOP
            tbl := split_part(item, '.', 1);
            col := split_part(item, '.', 2);
            EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE timestamptz USING %I AT TIME ZONE ''UTC''',
                           tbl, col, col);
        END LOOP;
    END IF;
END $$;

-- d) Drop complaints.latitude and longitude only if every row is NULL
DO $$
DECLARE
    non_null_count int := 0;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'complaints' AND column_name = 'latitude'
    ) THEN
        EXECUTE 'SELECT count(*) FROM complaints WHERE latitude IS NOT NULL OR longitude IS NOT NULL' INTO non_null_count;
        IF non_null_count = 0 THEN
            ALTER TABLE complaints DROP COLUMN IF EXISTS latitude;
            ALTER TABLE complaints DROP COLUMN IF EXISTS longitude;
            RAISE NOTICE 'Dropped complaints.latitude and longitude (all existing rows were NULL)';
        ELSE
            RAISE NOTICE 'Preserved complaints.latitude and longitude (% rows had non-null coordinates)', non_null_count;
        END IF;
    END IF;
END $$;

-- e) Ensure NOT NULL constraints on complaints and notices
ALTER TABLE complaints ALTER COLUMN citizen_name SET NOT NULL;
ALTER TABLE complaints ALTER COLUMN location_address SET NOT NULL;
ALTER TABLE notices ALTER COLUMN published_by SET NOT NULL;

-- f) Check constraints updates
-- Replace proposals_status_check
ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE proposals ADD CONSTRAINT proposals_status_check 
    CHECK (status IN ('ACTIVE', 'UNDER_REVIEW', 'FORWARDED', 'APPROVED', 'REJECTED', 'IN_PLANNING'));

-- Add complaints_status_check
ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check;
ALTER TABLE complaints ADD CONSTRAINT complaints_status_check 
    CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'RESOLVED', 'REJECTED', 'LINKED'));

-- g) New table complaint_feedback
CREATE TABLE IF NOT EXISTS complaint_feedback (
    id UUID PRIMARY KEY,
    complaint_id VARCHAR(100) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id VARCHAR(100) NOT NULL REFERENCES users(id),
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    satisfied BOOLEAN NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_complaint_citizen_feedback UNIQUE (complaint_id, citizen_id)
);
CREATE INDEX IF NOT EXISTS idx_complaint_feedback_complaint ON complaint_feedback(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_feedback_citizen ON complaint_feedback(citizen_id);

-- h) New table complaint_attachments & data migration
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id UUID PRIMARY KEY,
    complaint_id VARCHAR(100) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    kind VARCHAR(50) NOT NULL CHECK (kind IN ('REPORT', 'BEFORE', 'AFTER', 'COMPLETION', 'DELAY')),
    content_type VARCHAR(100),
    size_bytes INTEGER,
    data_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint ON complaint_attachments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_kind ON complaint_attachments(kind);

-- Migrate existing before_image, after_image, completion_image, delay_image, and images
DO $$
BEGIN
    -- before_image
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='complaints' AND column_name='before_image') THEN
        INSERT INTO complaint_attachments (id, complaint_id, kind, content_type, size_bytes, data_url, created_at)
        SELECT gen_random_uuid(), id, 'BEFORE',
               CASE WHEN before_image LIKE 'data:%' THEN split_part(split_part(before_image, ';', 1), ':', 2) ELSE 'image/jpeg' END,
               length(before_image), before_image, CURRENT_TIMESTAMP
        FROM complaints 
        WHERE before_image IS NOT NULL AND trim(before_image) <> '';
    END IF;

    -- after_image
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='complaints' AND column_name='after_image') THEN
        INSERT INTO complaint_attachments (id, complaint_id, kind, content_type, size_bytes, data_url, created_at)
        SELECT gen_random_uuid(), id, 'AFTER',
               CASE WHEN after_image LIKE 'data:%' THEN split_part(split_part(after_image, ';', 1), ':', 2) ELSE 'image/jpeg' END,
               length(after_image), after_image, CURRENT_TIMESTAMP
        FROM complaints 
        WHERE after_image IS NOT NULL AND trim(after_image) <> '';
    END IF;

    -- completion_image
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='complaints' AND column_name='completion_image') THEN
        INSERT INTO complaint_attachments (id, complaint_id, kind, content_type, size_bytes, data_url, created_at)
        SELECT gen_random_uuid(), id, 'COMPLETION',
               CASE WHEN completion_image LIKE 'data:%' THEN split_part(split_part(completion_image, ';', 1), ':', 2) ELSE 'image/jpeg' END,
               length(completion_image), completion_image, CURRENT_TIMESTAMP
        FROM complaints 
        WHERE completion_image IS NOT NULL AND trim(completion_image) <> '';
    END IF;

    -- delay_image
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='complaints' AND column_name='delay_image') THEN
        INSERT INTO complaint_attachments (id, complaint_id, kind, content_type, size_bytes, data_url, created_at)
        SELECT gen_random_uuid(), id, 'DELAY',
               CASE WHEN delay_image LIKE 'data:%' THEN split_part(split_part(delay_image, ';', 1), ':', 2) ELSE 'image/jpeg' END,
               length(delay_image), delay_image, CURRENT_TIMESTAMP
        FROM complaints 
        WHERE delay_image IS NOT NULL AND trim(delay_image) <> '';
    END IF;

    -- images (kind 'REPORT')
    -- Legacy comma-joined images: split ONLY on commas followed by 'data:' or 'http'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='complaints' AND column_name='images') THEN
        INSERT INTO complaint_attachments (id, complaint_id, kind, content_type, size_bytes, data_url, created_at)
        SELECT gen_random_uuid(), c.id, 'REPORT',
               CASE WHEN trim(img) LIKE 'data:%' THEN split_part(split_part(trim(img), ';', 1), ':', 2) ELSE 'image/jpeg' END,
               length(trim(img)), trim(img), CURRENT_TIMESTAMP
        FROM complaints c,
        LATERAL regexp_split_to_table(c.images, ',(?=(?:data:|http))') AS img
        WHERE c.images IS NOT NULL AND trim(img) <> '';
    END IF;
END $$;

-- Drop legacy image columns from complaints
ALTER TABLE complaints DROP COLUMN IF EXISTS images;
ALTER TABLE complaints DROP COLUMN IF EXISTS before_image;
ALTER TABLE complaints DROP COLUMN IF EXISTS after_image;
ALTER TABLE complaints DROP COLUMN IF EXISTS completion_image;
ALTER TABLE complaints DROP COLUMN IF EXISTS delay_image;

-- i) New table notification_reads
CREATE TABLE IF NOT EXISTS notification_reads (
    notification_id VARCHAR(100) NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads(user_id);

-- j) notices attachments columns
ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255);
ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(100);

-- k) wards: drop active_complaints and resolved_complaints
ALTER TABLE wards DROP COLUMN IF EXISTS active_complaints;
ALTER TABLE wards DROP COLUMN IF EXISTS resolved_complaints;

-- l) Sequence tracking_seq
CREATE SEQUENCE IF NOT EXISTS tracking_seq START WITH 100000 INCREMENT BY 1;

-- m) users: add address text column
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
