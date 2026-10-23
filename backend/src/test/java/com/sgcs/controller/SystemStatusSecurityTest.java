package com.sgcs.controller;

import com.sgcs.entity.User;
import com.sgcs.repository.UserRepository;
import com.sgcs.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SystemStatusSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtils jwtUtils;

    @MockBean
    private UserRepository userRepository;

    private User adminUser;
    private User citizenUser;
    private String adminToken;
    private String citizenToken;

    @BeforeEach
    public void setup() {
        adminUser = new User("admin_1", "Admin Boss", "admin@sgcs.gov", "pass", "9999999999", "ADMIN", "All Wards");
        adminUser.setStatus("ACTIVE");
        adminToken = jwtUtils.generateToken(adminUser);

        citizenUser = new User("citizen_1", "Citizen John", "john@sgcs.gov", "pass", "9999999991", "CITIZEN", "Ward 1");
        citizenUser.setStatus("ACTIVE");
        citizenToken = jwtUtils.generateToken(citizenUser);

        when(userRepository.findById("admin_1")).thenReturn(Optional.of(adminUser));
        when(userRepository.findById("citizen_1")).thenReturn(Optional.of(citizenUser));
    }

    @Test
    @DisplayName("Anonymous user should get 401 on /api/system-status")
    public void testAnonymousForbiddenOnSystemStatus() throws Exception {
        mockMvc.perform(get("/api/system-status"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CITIZEN user should get 403 on /api/system-status")
    public void testCitizenForbiddenOnSystemStatus() throws Exception {
        mockMvc.perform(get("/api/system-status")
                        .header("Authorization", "Bearer " + citizenToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ADMIN user gets 200 on /api/system-status and AI URL is NOT exposed")
    public void testAdminAccessSystemStatusWithoutAiUrl() throws Exception {
        mockMvc.perform(get("/api/system-status")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.aiServiceUrl").doesNotExist())
                .andExpect(jsonPath("$.firebaseReady").exists());
    }
}
