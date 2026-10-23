package com.sgcs.security;

import javax.crypto.SecretKey;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class JwtAuthenticationFilterTest {

    private JwtAuthenticationFilter filter;
    private JwtUtils jwtUtils;
    private com.sgcs.repository.UserRepository userRepository;
    private final String secret = "dummy_jwt_secret_key_12345678901234567890123456789012345678901234567890";

    @BeforeEach
    public void setup() {
        filter = new JwtAuthenticationFilter();
        jwtUtils = new JwtUtils();
        userRepository = mock(com.sgcs.repository.UserRepository.class);
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", secret);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 86400000L);
        ReflectionTestUtils.setField(filter, "jwtUtils", jwtUtils);
        ReflectionTestUtils.setField(filter, "userRepository", userRepository);
        JwtAuthenticationFilter.clearCache();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    public void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should skip JWT processing for OPTIONS preflight requests")
    public void testOptionsRequestBypassesAuth() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/complaints");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication(),
                "SecurityContext must remain unauthenticated for OPTIONS requests");
    }

    @Test
    @DisplayName("Should authenticate request when valid Bearer token is provided")
    public void testValidBearerTokenAuthenticates() throws Exception {
        com.sgcs.entity.User mockUser = new com.sgcs.entity.User(
                "usr_citizen_1", "Citizen User", "citizen@sgcs.gov", "password", "9876543210", "CITIZEN", "Ward 1"
        );
        mockUser.setStatus("ACTIVE");
        when(userRepository.findById("usr_citizen_1")).thenReturn(java.util.Optional.of(mockUser));

        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", "usr_citizen_1");
        claims.put("email", "citizen@sgcs.gov");
        claims.put("role", "CITIZEN");
        claims.put("ward", "Ward 1");
        claims.put("fullName", "Citizen User");

        String token = Jwts.builder()
                .claims(claims)
                .subject("usr_citizen_1")
                .issuer(JwtUtils.ISSUER)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/complaints");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication(),
                "SecurityContext must have authentication set for valid Bearer token");
        assertEquals("usr_citizen_1", ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId());
    }

    @Test
    @DisplayName("Should not authenticate request when Bearer token is missing or invalid")
    public void testMissingOrInvalidTokenDoesNotAuthenticate() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/complaints");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication(),
                "SecurityContext must be null when Authorization header is missing");
    }
}
