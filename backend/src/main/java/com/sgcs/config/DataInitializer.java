package com.sgcs.config;

import com.sgcs.entity.User;
import com.sgcs.entity.Ward;
import com.sgcs.repository.UserRepository;
import com.sgcs.repository.WardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WardRepository wardRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Drop restrictive PostgreSQL check constraints if present so all status and notification types persist
        try {
            jdbcTemplate.execute("ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check");
            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
            jdbcTemplate.execute("ALTER TABLE complaint_timeline DROP CONSTRAINT IF EXISTS complaint_timeline_status_check");
            System.out.println("✅ Adjusted PostgreSQL database table constraints.");
        } catch (Exception e) {
            System.out.println("Note on PostgreSQL constraint adjustment: " + e.getMessage());
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
            System.out.println("✅ Initialized municipal wards structure.");
        }

        // Seed/Update ONLY Super Admin Accounts
        User admin = userRepository.findByEmailIgnoreCase("admin@gnail.com")
            .orElseGet(() -> new User("usr_super_admin", "Municipal Super Admin", "admin@gnail.com", "", "9876543210", "ADMIN", "All Wards"));
        admin.setPassword(passwordEncoder.encode("admin12345"));
        admin.setFullName("Municipal Super Admin");
        admin.setRole("ADMIN");
        admin.setWard("All Wards");
        userRepository.save(admin);

        User adminAlt = userRepository.findByEmailIgnoreCase("admin@gmail.com")
            .orElseGet(() -> new User("usr_super_admin_alt", "Municipal Super Admin", "admin@gmail.com", "", "9876543210", "ADMIN", "All Wards"));
        adminAlt.setPassword(passwordEncoder.encode("admin12345"));
        adminAlt.setFullName("Municipal Super Admin");
        adminAlt.setRole("ADMIN");
        adminAlt.setWard("All Wards");
        userRepository.save(adminAlt);

        System.out.println("✅ Super Admin account verified in PostgreSQL. Database is clean and ready for user registration.");
    }
}
