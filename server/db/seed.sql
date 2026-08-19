-- SGCS Initial Seed Data

-- 1. Users Table (ONLY 1 Super Admin / Controller Account Seeded)
-- Citizens register themselves via Registration.
-- Councillors & Field Workers are registered exclusively by Super Admin via Admin Controller.
INSERT INTO users (id, full_name, email, password_hash, phone, role, ward, created_at) VALUES
(
    'usr_super_admin',
    'Super Admin',
    'admin@gnail.com',
    'admin12345',
    '+91 99000 11223',
    'ADMIN',
    'All Wards',
    CURRENT_TIMESTAMP
);

-- 2. Wards Master List
INSERT INTO wards (id, ward_number, name, councillor_name, councillor_email, population, active_complaints, resolved_complaints) VALUES
('w_1', 1, 'Central Town', 'Hon. Priya Verma', 'priya.councillor@sgcs.gov.in', 45000, 14, 182),
('w_2', 2, 'Riverside North', 'Hon. Rajesh Sharma', 'rajesh.councillor@sgcs.gov.in', 38000, 8, 145),
('w_3', 3, 'East Hill View', 'Hon. Sunita Roy', 'sunita.councillor@sgcs.gov.in', 42000, 19, 210),
('w_4', 4, 'Green Valley South', 'Hon. Vikram Malhotra', 'vikram.councillor@sgcs.gov.in', 51000, 11, 195);

-- 3. Initial Sample Wards Notices
INSERT INTO notices (id, title, content, ward, priority, published_by, publish_date, expiry_date, category) VALUES
('ntc_001', 'Scheduled Water Supply Interruption for Pipe Replacement', 'Please note that main feeder pipeline replacement work will take place on Thursday, Aug 7th between 9:00 AM and 4:00 PM. Residents of Ward 1 & Ward 2 are advised to store sufficient water in advance.', 'Ward 1 - Central Town', 'EMERGENCY', 'Municipal Head Office', '2026-08-04 12:00:00+00', '2026-08-08 00:00:00+00', 'Water Utility Advisory'),
('ntc_002', 'Civic Townhall Meeting: Annual Infrastructure Budget Consultation', 'All residents of Ward 1 are cordially invited to participate in the open Townhall session at Community Center Auditorium to present local priorities for the FY 2026-27 Municipal Budget allocation.', 'Ward 1 - Central Town', 'IMPORTANT', 'Municipal Head Office', '2026-08-02 10:00:00+00', '2026-08-15 00:00:00+00', 'Community Townhall');
