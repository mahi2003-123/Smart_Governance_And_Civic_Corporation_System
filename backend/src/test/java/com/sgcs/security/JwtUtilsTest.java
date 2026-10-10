package com.sgcs.security;

import com.sgcs.entity.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    public void setup() {
        jwtUtils = new JwtUtils();
        // Inject properties securely without Spring Boot Context
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "dummy_jwt_secret_key_12345678901234567890123456789012345678901234567890");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 86400000L);
    }

    @Test
    public void testGenerateAndValidateToken() {
        User user = new User();
        user.setId("usr_123");
        user.setFullName("Test User");
        user.setEmail("test@example.com");
        user.setRole("CITIZEN");
        user.setWard("Ward 1");

        String token = jwtUtils.generateToken(user);
        assertNotNull(token, "Token should not be null");

        assertTrue(jwtUtils.validateToken(token), "Token should be overwhelmingly valid");

        Claims claims = jwtUtils.getClaimsFromToken(token);
        assertEquals("usr_123", claims.getSubject(), "Subject should match user ID");
        assertEquals("CITIZEN", claims.get("role"), "Role should match");
    }

    @Test
    public void testValidateInvalidToken() {
        assertFalse(jwtUtils.validateToken("invalid.token.here"), "Invalid token should fail validation cleanly");
    }
}
