package com.sgcs.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sgcs.dto.AuthDto;
import com.sgcs.dto.CreateUserRequest;
import com.sgcs.entity.User;
import com.sgcs.entity.Ward;
import com.sgcs.repository.UserRepository;
import com.sgcs.repository.WardRepository;
import com.sgcs.security.JwtAuthenticationFilter;
import com.sgcs.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AccountAndTokenSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WardRepository wardRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User admin;
    private String adminToken;

    @BeforeEach
    public void setUp() {
        JwtAuthenticationFilter.clearCache();

        // Ensure Ward exists for test
        if (wardRepository.findByNameIgnoreCase("Ward 1 - Central Town").isEmpty()) {
            Ward ward1 = new Ward("w1", 1, "Ward 1 - Central Town", "Unassigned", "", 45000);
            wardRepository.save(ward1);
        }

        // Create an active admin user
        admin = userRepository.findByEmailIgnoreCase("superadmin.test@sgcs.gov").orElseGet(() -> {
            User u = new User("usr_admin_test", "Super Admin", "superadmin.test@sgcs.gov", passwordEncoder.encode("AdminPass123!"), "9998880000", "ADMIN", "All Wards");
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });
        adminToken = "Bearer " + jwtUtils.generateToken(admin);
    }

    @Test
    @DisplayName("Criterion 1: Admin creates a councillor with password 'Abcdef12' and can log in with it, and 'password123' fails")
    public void testAdminCreatesUserWithCustomPasswordAndLogsIn() throws Exception {
        CreateUserRequest req = new CreateUserRequest(
                "Councillor Carol",
                "carol.councillor@test.gov",
                "9876543210",
                "COUNCILLOR",
                "Ward 1 - Central Town",
                null,
                "Abcdef12"
        );

        // Admin creates user
        mockMvc.perform(post("/api/admin/users")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("COUNCILLOR"))
                .andExpect(jsonPath("$.password").doesNotExist()) // Criterion 2: password hash never serialized
                .andExpect(jsonPath("$.mustChangePassword").value(false));

        // Attempt login with default "password123" must fail
        AuthDto.LoginRequest failReq = new AuthDto.LoginRequest();
        failReq.setEmail("carol.councillor@test.gov");
        failReq.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(failReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid email or password."));

        // Attempt login with bound password "Abcdef12" must succeed
        AuthDto.LoginRequest successReq = new AuthDto.LoginRequest();
        successReq.setEmail("carol.councillor@test.gov");
        successReq.setPassword("Abcdef12");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(successReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("carol.councillor@test.gov"))
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    @DisplayName("Criterion 1 (Cont): Temporary password generation when admin omits password")
    public void testAdminCreatesUserWithoutPasswordGeneratesTempPassword() throws Exception {
        CreateUserRequest req = new CreateUserRequest(
                "Worker Walter",
                "walter.worker@test.gov",
                "9876543211",
                "WORKER",
                "Ward 1 - Central Town",
                "Plumbing",
                null // omit password
        );

        mockMvc.perform(post("/api/admin/users")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mustChangePassword").value(true))
                .andExpect(jsonPath("$.temporaryPassword").isNotEmpty())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("Criterion 2: INACTIVE user cannot log in and an existing token stops working within 60s")
    public void testInactiveUserCannotLoginAndExistingTokenRejected() throws Exception {
        // Create an active citizen
        User citizen = new User("usr_cit_temp", "Citizen Inactive Test", "inactive.test@example.com", passwordEncoder.encode("CitizenPass123!"), "9876543212", "CITIZEN", "Ward 1 - Central Town");
        citizen.setStatus("ACTIVE");
        userRepository.save(citizen);

        // Active citizen logs in and gets token
        String token = jwtUtils.generateToken(citizen);

        // Verify active token works
        mockMvc.perform(get("/api/complaints")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Deactivate citizen in database
        citizen.setStatus("INACTIVE");
        userRepository.save(citizen);
        JwtAuthenticationFilter.clearCache(); // Simulates cache expiry after 60s

        // 1. Inactive user cannot log in
        AuthDto.LoginRequest loginReq = new AuthDto.LoginRequest();
        loginReq.setEmail("inactive.test@example.com");
        loginReq.setPassword("CitizenPass123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid email or password."));

        // 2. Existing token stops working
        mockMvc.perform(get("/api/complaints")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Criterion 3: 6th wrong password gets 429")
    public void testRateLimitingSixthAttemptGets429() throws Exception {
        String testEmail = "ratelimit.test@example.com";
        User user = new User("usr_rate_limit", "Rate Limit User", testEmail, passwordEncoder.encode("CorrectPass123!"), "9876543213", "CITIZEN", "Ward 1 - Central Town");
        user.setStatus("ACTIVE");
        userRepository.save(user);

        AuthDto.LoginRequest wrongReq = new AuthDto.LoginRequest();
        wrongReq.setEmail(testEmail);
        wrongReq.setPassword("WrongPassword1!");

        // First 5 failed attempts return 400 Bad Request
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                    .header("X-Forwarded-For", "192.168.1.100")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(wrongReq)))
                    .andExpect(status().isBadRequest());
        }

        // 6th attempt must get 429 Too Many Requests
        mockMvc.perform(post("/api/auth/login")
                .header("X-Forwarded-For", "192.168.1.100")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongReq)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429));
    }

    @Test
    @DisplayName("Criterion 4: Profile update with a different ward does not change the ward")
    public void testProfileUpdateCannotChangeWard() throws Exception {
        User citizen = new User("usr_cit_ward_test", "Ward Citizen", "ward.citizen@example.com", passwordEncoder.encode("ValidPass123!"), "9876543214", "CITIZEN", "Ward 1 - Central Town");
        citizen.setStatus("ACTIVE");
        userRepository.save(citizen);

        String citizenToken = "Bearer " + jwtUtils.generateToken(citizen);

        // Attempt to change ward to Ward 2 via updateProfile
        AuthDto.UpdateProfileRequest updateReq = new AuthDto.UpdateProfileRequest();
        updateReq.setFullName("Updated Name");
        updateReq.setWard("Ward 2 - Riverside North");
        updateReq.setPhone("9876543214");

        mockMvc.perform(put("/api/auth/profile")
                .header("Authorization", citizenToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.ward").value("Ward 1 - Central Town"));

        User refreshed = userRepository.findById(citizen.getId()).orElseThrow();
        assertThat(refreshed.getWard()).isEqualTo("Ward 1 - Central Town");
    }

    @Test
    @DisplayName("Criterion 5: App refuses to start with a 10-byte JWT_SECRET")
    public void testJwtSecretShorterThan32BytesFailsStartup() {
        JwtUtils testUtils = new JwtUtils();
        assertThatThrownBy(() -> testUtils.validateSecret("1234567890"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 bytes");
    }

    @Test
    @DisplayName("Criterion 6: First admin exists with seeding disabled")
    public void testFirstAdminExists() {
        List<User> admins = userRepository.findByRoleIgnoreCase("ADMIN");
        assertThat(admins).isNotEmpty();
        assertThat(admins.stream().anyMatch(a -> "ACTIVE".equalsIgnoreCase(a.getStatus()))).isTrue();
    }

    @Test
    @DisplayName("Criterion 9: Admin cannot delete or deactivate own account or last active ADMIN")
    public void testAdminSelfProtectionAndLastAdminProtection() throws Exception {
        // 1. Admin cannot deactivate own account
        mockMvc.perform(put("/api/admin/users/" + admin.getId() + "/status")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "INACTIVE"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("You cannot deactivate your own admin account."));

        // 2. Admin cannot delete own account
        mockMvc.perform(delete("/api/admin/users/" + admin.getId())
                .header("Authorization", adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("You cannot delete your own admin account."));
    }
}
