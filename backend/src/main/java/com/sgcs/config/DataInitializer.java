package com.sgcs.config;

import com.sgcs.entity.User;
import com.sgcs.entity.Ward;
import com.sgcs.repository.UserRepository;
import com.sgcs.repository.WardRepository;
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
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /** Admin email — set ADMIN_EMAIL in production environment. */
    @Value("${admin.email:#{null}}")
    private String adminEmail;

    /** Admin password — set ADMIN_PASSWORD in production environment. */
    @Value("${admin.password:#{null}}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Drop restrictive PostgreSQL check constraints if present so all status and notification types persist
        try {
            jdbcTemplate.execute("ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check");
            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
            jdbcTemplate.execute("ALTER TABLE complaint_timeline DROP CONSTRAINT IF EXISTS complaint_timeline_status_check");
            logger.info("Adjusted PostgreSQL database table constraints.");
        } catch (Exception e) {
            logger.warn("Note on PostgreSQL constraint adjustment: {}", e.getMessage());
        }

        // Seed standard municipal Wards if empty
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
            logger.info("Initialized municipal wards structure.");
        }

        // Seed admin account only when ADMIN_EMAIL and ADMIN_PASSWORD are supplied
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
                logger.info("Seeded admin account for: {}", adminEmail.trim());
            } else {
                logger.info("Admin account already exists for: {}. Skipping seed.", adminEmail.trim());
            }
        } else {
            logger.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set — no default admin will be seeded. " +
                        "Create an admin account via the registration API or set these env vars.");
        }

        logger.info("Database initialization complete.");
    }
}
