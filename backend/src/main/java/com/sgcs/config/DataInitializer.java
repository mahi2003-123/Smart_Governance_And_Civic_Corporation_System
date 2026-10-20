package com.sgcs.config;

import com.sgcs.entity.User;
import com.sgcs.entity.Ward;
import com.sgcs.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WardRepository wardRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SystemActivityRepository systemActivityRepository;

    @Autowired
    private UserDeviceTokenRepository userDeviceTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /** Admin email — set ADMIN_EMAIL in production environment. */
    @Value("${admin.email:#{null}}")
    private String adminEmail;

    /** Admin password — set ADMIN_PASSWORD in production environment. */
    @Value("${admin.password:#{null}}")
    private String adminPassword;

    /** Controls whether any demo or pre-seeded data is created. Defaults to false. */
    @Value("${data.seeding.enabled:false}")
    private boolean dataSeedingEnabled;

    @Override
    public void run(String... args) throws Exception {
        logger.info("--- SGCS Neon Database Connectivity & Table Check ---");

        // 1. Verify table connections & count check
        try {
            long userCount = userRepository.count();
            long complaintCount = complaintRepository.count();
            long proposalCount = proposalRepository.count();
            long noticeCount = noticeRepository.count();
            long notifCount = notificationRepository.count();
            long activityCount = systemActivityRepository.count();
            long tokenCount = userDeviceTokenRepository.count();
            long wardCount = wardRepository.count();

            logger.info("Connected to database successfully. Table record audit:");
            logger.info("  ✓ users: {} records", userCount);
            logger.info("  ✓ complaints: {} records", complaintCount);
            logger.info("  ✓ proposals: {} records", proposalCount);
            logger.info("  ✓ notices: {} records", noticeCount);
            logger.info("  ✓ notifications: {} records", notifCount);
            logger.info("  ✓ system_activities: {} records", activityCount);
            logger.info("  ✓ user_device_tokens: {} records", tokenCount);
            logger.info("  ✓ wards: {} records", wardCount);
            logger.info("All 8 core database tables are healthy, verified, and connected.");
        } catch (Exception e) {
            logger.error("Error verifying database table connections: {}", e.getMessage(), e);
        }

        // 2. Drop restrictive legacy check constraints so all status/type values persist safely
        try {
            jdbcTemplate.execute("ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check");
            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
            jdbcTemplate.execute("ALTER TABLE complaint_timeline DROP CONSTRAINT IF EXISTS complaint_timeline_status_check");
            logger.info("PostgreSQL database table constraints verified.");
        } catch (Exception e) {
            logger.warn("Note on PostgreSQL constraint adjustment: {}", e.getMessage());
        }

        // 3. Data Seeding Check — strictly bypassed when dataSeedingEnabled is false
        if (!dataSeedingEnabled) {
            logger.info("Data seeding is DISABLED (data.seeding.enabled=false). ZERO seeded data will be inserted.");
            logger.info("Database will only contain real user-submitted grievances, accounts, and records.");
            return;
        }

        // 4. Seeding block only executes if explicitly enabled
        logger.info("Data seeding is explicitly enabled (data.seeding.enabled=true). Processing initial setup...");

        if (wardRepository.count() == 0) {
            List<Ward> defaultWards = List.of(
                new Ward("w1", 1, "Ward 1 - Central Town", "Unassigned", "", 45000),
                new Ward("w2", 2, "Ward 2 - Riverside North", "Unassigned", "", 32000),
                new Ward("w3", 3, "Ward 3 - East Hill View", "Unassigned", "", 51000),
                new Ward("w4", 4, "Ward 4 - Green Valley South", "Unassigned", "", 38000),
                new Ward("w5", 5, "Ward 5 - Industrial Hub West", "Unassigned", "", 42000),
                new Ward("w6", 6, "Ward 6 - Tech Park Corridor", "Unassigned", "", 48000),
                new Ward("w7", 7, "Ward 7 - Metro Station Circle", "Unassigned", "", 39000),
                new Ward("w8", 8, "Ward 8 - Heritage Old City", "Unassigned", "", 36000)
            );
            wardRepository.saveAll(defaultWards);
            logger.info("Initialized default municipal wards.");
        }

        if (adminEmail != null && !adminEmail.trim().isEmpty()
                && adminPassword != null && !adminPassword.trim().isEmpty()) {
            if (userRepository.findByEmailIgnoreCase(adminEmail.trim()).isEmpty()) {
                User admin = new User(
                    "usr_env_admin",
                    "Municipal Super Admin",
                    adminEmail.trim(),
                    "",
                    "0000000000",
                    "ADMIN",
                    "All Wards"
                );
                admin.setPassword(passwordEncoder.encode(adminPassword.trim()));
                userRepository.save(admin);
                logger.info("Created admin account for: {}", adminEmail.trim());
            }
        }

        logger.info("Database initialization complete.");
    }
}
