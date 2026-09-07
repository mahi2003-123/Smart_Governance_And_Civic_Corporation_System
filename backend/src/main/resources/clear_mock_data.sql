-- Clean all test data completely
DELETE FROM complaints;
DELETE FROM proposals;
DELETE FROM notices;
DELETE FROM notifications;
DELETE FROM users WHERE role != 'ADMIN';

-- Reset ward councillor assignments
UPDATE wards SET councillor_name = 'Unassigned', councillor_email = '';
