-- SGCS Database Cleanup Script for Specific Seed Records
-- Execute this script manually against PostgreSQL database (sgcs_db)
-- WARNING: This script deletes ONLY the original test seed records by ID.
-- Real user accounts, complaints, and ward data created during testing are preserved.

-- 1. Remove seeded notice records by seed ID
DELETE FROM notices
WHERE id IN ('ntc_001', 'ntc_002');

-- 2. Remove seeded ward records by seed ID
DELETE FROM wards
WHERE id IN ('w_1', 'w_2', 'w_3', 'w_4');

-- 3. Remove super admin seed user record by seed ID
DELETE FROM users
WHERE id IN ('usr_super_admin');
