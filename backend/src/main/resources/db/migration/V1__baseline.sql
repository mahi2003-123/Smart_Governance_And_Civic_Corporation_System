-- V1__baseline.sql: SGCS Baseline Schema
-- Creates initial 12 entity tables and indexes if they do not already exist.
-- Built from JPA entities and legacy schema. Safe no-op on existing databases.

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'admin123',
    must_change_password BOOLEAN DEFAULT FALSE,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CONSTRAINT users_role_check CHECK (role IN ('CITIZEN', 'COUNCILLOR', 'WORKER', 'ADMIN')),
    ward VARCHAR(100),
    specialization VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wards (
    id VARCHAR(100) PRIMARY KEY,
    ward_number INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    councillor_name VARCHAR(255),
    councillor_email VARCHAR(255),
    population INTEGER DEFAULT 0,
    active_complaints INTEGER DEFAULT 0,
    resolved_complaints INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(100) PRIMARY KEY,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL CONSTRAINT complaints_priority_check CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    description TEXT NOT NULL,
    ward VARCHAR(100) NOT NULL,
    location_address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CONSTRAINT complaints_status_check CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
    citizen_id VARCHAR(100) NOT NULL,
    citizen_name VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(50),
    assigned_worker_id VARCHAR(100),
    assigned_worker_name VARCHAR(255),
    images TEXT,
    completion_image TEXT,
    assigned_date TIMESTAMP WITHOUT TIME ZONE,
    due_date TIMESTAMP WITHOUT TIME ZONE,
    before_image TEXT,
    after_image TEXT,
    worker_notes TEXT,
    delay_reason VARCHAR(255),
    delay_notes TEXT,
    delay_image TEXT,
    ai_suggested_category VARCHAR(100),
    ai_confidence DOUBLE PRECISION,
    ai_model VARCHAR(100),
    ai_status VARCHAR(100),
    is_ai_category_accepted BOOLEAN,
    master_complaint_id VARCHAR(100),
    possible_duplicate_id VARCHAR(100),
    duplicate_similarity_score DOUBLE PRECISION,
    is_duplicate_confirmed BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaint_timeline (
    id VARCHAR(100) PRIMARY KEY,
    complaint_id VARCHAR(100) REFERENCES complaints(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actor_name VARCHAR(255),
    actor_role VARCHAR(50),
    status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS complaint_comments (
    id VARCHAR(100) PRIMARY KEY,
    complaint_id VARCHAR(100) REFERENCES complaints(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proposals (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    ward VARCHAR(100) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) DEFAULT 'CITIZEN',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CONSTRAINT proposals_status_check CHECK (status IN ('ACTIVE', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    councillor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proposal_comments (
    id VARCHAR(100) PRIMARY KEY,
    proposal_id VARCHAR(100) REFERENCES proposals(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proposal_user_votes (
    proposal_id VARCHAR(100) REFERENCES proposals(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    vote_type VARCHAR(10),
    PRIMARY KEY (proposal_id, user_id)
);

CREATE TABLE IF NOT EXISTS notices (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    ward VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL CONSTRAINT notices_priority_check CHECK (priority IN ('NORMAL', 'IMPORTANT', 'EMERGENCY')),
    published_by VARCHAR(255) NOT NULL,
    publish_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMPTZ,
    category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100),
    recipient_id VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    "read" BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    link_url VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_activities (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100),
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    reference VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_device_tokens (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    fcm_token TEXT NOT NULL UNIQUE,
    device_type VARCHAR(50),
    device_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_ward ON complaints(ward);
CREATE INDEX IF NOT EXISTS idx_proposals_ward ON proposals(ward);
CREATE INDEX IF NOT EXISTS idx_notices_ward ON notices(ward);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_user_device_tokens_user ON user_device_tokens(user_id);
