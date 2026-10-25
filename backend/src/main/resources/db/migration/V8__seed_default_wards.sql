-- V8__seed_default_wards.sql: Seed essential municipal wards
INSERT INTO wards (id, ward_number, name, councillor_name, councillor_email, population)
VALUES
    ('w1', 1, 'Ward 1 - Central Town', 'Unassigned', '', 45000),
    ('w2', 2, 'Ward 2 - Riverside North', 'Unassigned', '', 32000),
    ('w3', 3, 'Ward 3 - East Hill View', 'Unassigned', '', 51000),
    ('w4', 4, 'Ward 4 - Green Valley South', 'Unassigned', '', 38000),
    ('w5', 5, 'Ward 5 - Industrial Hub West', 'Unassigned', '', 42000),
    ('w6', 6, 'Ward 6 - Tech Park Corridor', 'Unassigned', '', 48000),
    ('w7', 7, 'Ward 7 - Metro Station Circle', 'Unassigned', '', 39000),
    ('w8', 8, 'Ward 8 - Heritage Old City', 'Unassigned', '', 36000)
ON CONFLICT (ward_number) DO NOTHING;
