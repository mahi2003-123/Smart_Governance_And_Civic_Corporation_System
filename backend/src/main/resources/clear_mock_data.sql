-- SGCS Targeted Seed & Mock Data Cleanup Script
-- Removes ONLY specific pre-seeded demo records by explicit ID and Email.
-- Real user accounts, citizen complaints, community proposals, ward notices, and notifications created during actual use are completely preserved.

-- 1. Remove specific seed notices by ID
DELETE FROM notices
WHERE id IN ('ntc_001', 'ntc_002', 'ntc_demo_01');

-- 2. Remove specific seed complaints by ID
DELETE FROM complaints
WHERE id IN ('cmp_seed_001', 'cmp_seed_002');

-- 3. Remove specific seed proposals by ID
DELETE FROM proposals
WHERE id IN ('prop_seed_001', 'prop_seed_002');

-- 4. Remove specific seed notifications by ID
DELETE FROM notifications
WHERE id IN ('notif_seed_001', 'notif_seed_002');

-- 5. Remove specific non-admin seed test accounts by explicit ID / Email
DELETE FROM users
WHERE id IN ('usr_seed_citizen', 'usr_seed_councillor', 'usr_seed_worker', 'usr_demo_01')
   OR email IN ('demo_citizen@example.com', 'demo_councillor@example.com', 'demo_worker@example.com', 'test_seed_user@example.com');
