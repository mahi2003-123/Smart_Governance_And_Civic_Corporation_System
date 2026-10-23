package com.sgcs.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class CorsConfigTest {

    private CorsConfig corsConfig;
    private Environment mockEnv;

    @BeforeEach
    public void setup() {
        corsConfig = new CorsConfig();
        mockEnv = mock(Environment.class);
        when(mockEnv.getActiveProfiles()).thenReturn(new String[]{"dev"});
        ReflectionTestUtils.setField(corsConfig, "environment", mockEnv);
        ReflectionTestUtils.setField(corsConfig, "corsAllowedOriginsRaw", "http://localhost:5173,https://sgcs-frontend.onrender.com");
    }

    @Test
    @DisplayName("Should allow vercel app origin via origin patterns")
    public void testVercelOriginAllowedViaPattern() {
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();
        CorsConfiguration config = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/health"));
        assertNotNull(config);
        assertEquals("https://sgcs-portal.vercel.app", config.checkOrigin("https://sgcs-portal.vercel.app"),
                "checkOrigin must allow *.vercel.app origins via origin pattern");
    }

    @Test
    @DisplayName("Should allow production frontend origin when present in CORS_ALLOWED_ORIGINS")
    public void testProductionFrontendOriginAllowed() {
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/complaints");
        request.addHeader("Origin", "https://sgcs-frontend.onrender.com");
        request.addHeader("Access-Control-Request-Method", "POST");
        request.addHeader("Access-Control-Request-Headers", "Authorization, Content-Type");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config, "CORS configuration should be found for /api/complaints");
        assertTrue(config.getAllowedOrigins().contains("https://sgcs-frontend.onrender.com"),
                "Allowed origins must contain the configured frontend URL");
        assertEquals("https://sgcs-frontend.onrender.com", config.checkOrigin("https://sgcs-frontend.onrender.com"),
                "checkOrigin must return the configured frontend origin");
    }

    @Test
    @DisplayName("Should allow localhost and local dev origins when dev profile is active")
    public void testLocalDevOriginsAllowed() {
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/health");
        request.addHeader("Origin", "http://localhost:5173");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config);
        assertTrue(config.getAllowedOrigins().contains("http://localhost:5173"));
        assertTrue(config.getAllowedOrigins().contains("http://127.0.0.1:5173"));
    }

    @Test
    @DisplayName("Should NOT include localhost when dev profile is inactive and not in CORS_ALLOWED_ORIGINS")
    public void testLocalDevDisallowedInProdWithoutConfig() {
        when(mockEnv.getActiveProfiles()).thenReturn(new String[]{"prod"});
        ReflectionTestUtils.setField(corsConfig, "corsAllowedOriginsRaw", "https://custom-app.com");
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();
        CorsConfiguration config = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/health"));
        assertNotNull(config);
        assertFalse(config.getAllowedOrigins().contains("http://localhost:5173"));
        assertFalse(config.getAllowedOrigins().contains("http://127.0.0.1:5173"));
        assertTrue(config.getAllowedOrigins().contains("https://custom-app.com"));
    }

    @Test
    @DisplayName("Should normalize origins by removing trailing slashes")
    public void testTrailingSlashNormalization() {
        ReflectionTestUtils.setField(corsConfig, "corsAllowedOriginsRaw", "https://custom-domain.org/");
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/health");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config);
        assertTrue(config.getAllowedOrigins().contains("https://custom-domain.org"),
                "Trailing slash must be stripped from configured origins");
        assertFalse(config.getAllowedOrigins().contains("https://custom-domain.org/"),
                "Origins list must not contain trailing slash variant");
    }

    @Test
    @DisplayName("Should disallow unknown or malicious origins")
    public void testDisallowUnauthorizedOrigin() {
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/complaints");
        request.addHeader("Origin", "https://malicious-attacker.com");
        request.addHeader("Access-Control-Request-Method", "POST");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config);
        assertNull(config.checkOrigin("https://malicious-attacker.com"),
                "checkOrigin should return null for unauthorized origin");
    }

    @Test
    @DisplayName("Should support all required HTTP methods including GET, POST, PUT, PATCH, DELETE, OPTIONS")
    public void testAllowedMethods() {
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/notifications");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config);
        List<String> methods = config.getAllowedMethods();
        assertTrue(methods.containsAll(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")),
                "All standard REST and preflight methods must be allowed");
    }

    @Test
    @DisplayName("Should allow required headers Authorization and Content-Type")
    public void testAllowedHeaders() {
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/auth/login");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config);
        List<String> headers = config.getAllowedHeaders();
        assertTrue(headers.contains("Authorization"), "Headers must contain Authorization");
        assertTrue(headers.contains("Content-Type"), "Headers must contain Content-Type");
    }

    @Test
    @DisplayName("Should not combine wildcard origin with allowCredentials(true)")
    public void testNoWildcardOriginWithCredentials() {
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/complaints");
        request.addHeader("Origin", "https://sgcs-frontend.onrender.com");
        request.addHeader("Access-Control-Request-Method", "GET");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config);
        assertTrue(Boolean.TRUE.equals(config.getAllowCredentials()), "Credentials must be enabled");
        assertFalse(config.getAllowedOrigins().contains("*"),
                "Allowed origins must NEVER contain wildcard '*' when allowCredentials is true");
    }

    @Test
    @DisplayName("Should execute preflight request through CorsFilter with 200 OK and CORS headers for affected endpoints")
    public void testPreflightThroughCorsFilter() throws Exception {
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();
        CorsFilter filter = new CorsFilter(source);

        String[] testEndpoints = new String[]{"/api/health", "/api/auth/login", "/api/notifications", "/api/complaints"};

        for (String endpoint : testEndpoints) {
            MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", endpoint);
            request.addHeader("Origin", "https://sgcs-frontend.onrender.com");
            request.addHeader("Access-Control-Request-Method", "POST");
            request.addHeader("Access-Control-Request-Headers", "authorization, content-type");

            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain filterChain = new MockFilterChain();

            filter.doFilter(request, response, filterChain);

            assertEquals(200, response.getStatus(), "Preflight response status should be 200 OK for " + endpoint);
            assertEquals("https://sgcs-frontend.onrender.com", response.getHeader("Access-Control-Allow-Origin"),
                    "Access-Control-Allow-Origin must match the requesting origin for " + endpoint);
            assertTrue(response.getHeader("Access-Control-Allow-Methods").contains("POST"),
                    "Access-Control-Allow-Methods must allow POST for " + endpoint);
            assertTrue(response.getHeader("Access-Control-Allow-Headers").toLowerCase().contains("authorization"),
                    "Access-Control-Allow-Headers must allow authorization for " + endpoint);
            assertEquals("true", response.getHeader("Access-Control-Allow-Credentials"),
                    "Access-Control-Allow-Credentials must be true for " + endpoint);
        }
    }
}
