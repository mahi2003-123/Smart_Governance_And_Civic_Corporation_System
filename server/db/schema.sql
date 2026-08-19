-- SGCS (Smart Governance & Civic Corporation System) PostgreSQL Database Schema

-- Drop tables if exists (for clean resets)
DROP TABLE IF EXISTS proposal_votes CASCADE;
DROP TABLE IF EXISTS complaint_comments CASCADE;
DROP TABLE IF EXISTS complaint_timeline CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS wards CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Super Admin is created here by default; Citizens register via web; Councillors & Workers registered by Super Admin)
CREATE TABLE users (
    id VARCHAR(100) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'admin123',
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('CITIZEN', 'COUNCILLOR', 'WORKER', 'ADMIN')),
    ward VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wards Table
CREATE TABLE wards (
    id VARCHAR(100) PRIMARY KEY,
    ward_number INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    councillor_name VARCHAR(255),
    councillor_email VARCHAR(255),
    population INTEGER DEFAULT 0,
    active_complaints INTEGER DEFAULT 0,
    resolved_complaints INTEGER DEFAULT 0
);

-- 3. Complaints Table
CREATE TABLE complaints (
    id VARCHAR(100) PRIMARY KEY,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    description TEXT NOT NULL,
    ward VARCHAR(100) NOT NULL,
    location_address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
    citizen_id VARCHAR(100) NOT NULL,
    citizen_name VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(50),
    assigned_worker_id VARCHAR(100),
    assigned_worker_name VARCHAR(255),
    images JSONB DEFAULT '[]'::jsonb,
    completion_image TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Complaint Timeline Table
CREATE TABLE complaint_timeline (
    id VARCHAR(100) PRIMARY KEY,
    complaint_id VARCHAR(100) REFERENCES complaints(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actor_name VARCHAR(255),
    actor_role VARCHAR(50),
    status VARCHAR(50)
);

-- 5. Complaint Comments Table
CREATE TABLE complaint_comments (
    id VARCHAR(100) PRIMARY KEY,
    complaint_id VARCHAR(100) REFERENCES complaints(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Community Proposals Table
CREATE TABLE proposals (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    ward VARCHAR(100) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) DEFAULT 'CITIZEN',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    councillor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Proposal Votes Tracking Table
CREATE TABLE proposal_votes (
    id VARCHAR(100) PRIMARY KEY,
    proposal_id VARCHAR(100) REFERENCES proposals(id) ON DELETE CASCADE,
    citizen_id VARCHAR(100) NOT NULL,
    vote_type VARCHAR(10) CHECK (vote_type IN ('UP', 'DOWN')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, citizen_id)
);

-- 8. Ward Notices Table
CREATE TABLE notices (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    ward VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('NORMAL', 'IMPORTANT', 'EMERGENCY')),
    published_by VARCHAR(255) NOT NULL,
    publish_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMPTZ,
    category VARCHAR(100)
);

-- 9. Notifications Table
CREATE TABLE notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('COMPLAINT', 'NOTICE', 'PROPOSAL', 'FEEDBACK')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    link_url VARCHAR(255)
);

-- Performance Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_ward ON complaints(ward);
CREATE INDEX idx_proposals_ward ON proposals(ward);
CREATE INDEX idx_notices_ward ON notices(ward);
CREATE INDEX idx_notifications_user ON notifications(user_id);
