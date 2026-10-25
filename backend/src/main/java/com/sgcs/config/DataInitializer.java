package com.sgcs.config;

import com.sgcs.entity.User;
import com.sgcs.entity.Ward;
import com.sgcs.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
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
    private org.springframework.core.env.Environment env;

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
        logger.info("--- SGCS Database Connectivity & Table Check ---");

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
        } catch (Exception e) {
            logger.error("Error verifying database table connections: {}", e.getMessage(), e);
        }

        // 2. ALWAYS create the first admin when no ADMIN user exists, independent of data.seeding.enabled
        boolean isProduction = java.util.Arrays.asList(env.getActiveProfiles()).contains("prod")
                || java.util.Arrays.asList(env.getActiveProfiles()).contains("production")
                || "production".equalsIgnoreCase(System.getenv("SPRING_PROFILES_ACTIVE"))
                || "prod".equalsIgnoreCase(System.getenv("SPRING_PROFILES_ACTIVE"))
                || "production".equalsIgnoreCase(System.getenv("ENVIRONMENT"))
                || "prod".equalsIgnoreCase(System.getenv("ENVIRONMENT"));

        if (isProduction && adminPassword != null && !adminPassword.isEmpty() && adminPassword.length() < 12) {
            throw new IllegalStateException("ADMIN_PASSWORD must be at least 12 characters in production. Refusing to start.");
        }

        List<User> existingAdmins = userRepository.findByRoleIgnoreCase("ADMIN");
        if (existingAdmins.isEmpty()) {
            String effectiveEmail = (adminEmail != null && !adminEmail.trim().isEmpty())
                    ? adminEmail.trim().toLowerCase()
                    : "admin@sgcs.gov";

            String effectivePassword = (adminPassword != null && !adminPassword.isEmpty())
                    ? adminPassword
                    : "Admin@SGCS2026!";

            if (isProduction && effectivePassword.length() < 12) {
                throw new IllegalStateException("ADMIN_PASSWORD must be at least 12 characters in production. Refusing to start.");
            }

            User firstAdmin = new User(
                    "usr_env_admin",
                    "Municipal Super Admin",
                    effectiveEmail,
                    "",
                    "0000000000",
                    "ADMIN",
                    "All Wards"
            );
            firstAdmin.setPassword(passwordEncoder.encode(effectivePassword));
            firstAdmin.setStatus("ACTIVE");
            userRepository.save(firstAdmin);
            logger.info("Created first ADMIN account for: {}", effectiveEmail);
        }

        // 3. Ensure essential municipal wards always exist in database
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

        // Sync registered councillors to ward records
        try {
            List<User> registeredCouncillors = userRepository.findByRoleIgnoreCase("COUNCILLOR");
            List<Ward> currentWards = wardRepository.findAll();
            for (User c : registeredCouncillors) {
                if (c.getWard() != null && !c.getWard().trim().isEmpty() && ("ACTIVE".equalsIgnoreCase(c.getStatus()) || c.getStatus() == null)) {
                    for (Ward w : currentWards) {
                        String cWard = c.getWard().toLowerCase().trim();
                        String wName = w.getName().toLowerCase().trim();
                        if (wName.contains(cWard) || cWard.contains(wName) ||
                            (w.getWardNumber() != null && cWard.contains(String.valueOf(w.getWardNumber())))) {
                            w.setCouncillorName(c.getFullName());
                            w.setCouncillorEmail(c.getEmail());
                            wardRepository.save(w);
                            logger.info("Linked Councillor {} to Ward {}", c.getFullName(), w.getName());
                            break;
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Warning syncing councillors to wards: {}", e.getMessage());
        }

        // 4. Data Seeding Check — strictly bypassed when dataSeedingEnabled is false
        if (!dataSeedingEnabled) {
            logger.info("Data seeding is DISABLED (data.seeding.enabled=false). ZERO mock complaints/proposals will be inserted.");
            return;
        }

        // 5. Seeding block only executes if explicitly enabled
        logger.info("Data seeding is explicitly enabled (data.seeding.enabled=true). Processing initial setup...");

        logger.info("Database initialization complete.");
    }
}
