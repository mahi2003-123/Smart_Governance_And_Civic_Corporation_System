package com.sgcs.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Central CORS configuration bean.
 * Allows requests from:
 *   - https://sgcs-frontend.onrender.com (Production Render Frontend)
 *   - Configured origins in CORS_ALLOWED_ORIGINS
 *   - Local development origins (localhost:5173, 127.0.0.1:5173, localhost:3000, 127.0.0.1:3000)
 */
@Configuration
public class CorsConfig {

    public static final String PRODUCTION_FRONTEND_ORIGIN = "https://sgcs-frontend.onrender.com";

    @Value("${cors.allowed.origins:http://localhost:5173,https://sgcs-frontend.onrender.com}")
    private String corsAllowedOriginsRaw;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = new ArrayList<>();

        // 1. Always allow production Render frontend origin
        origins.add(PRODUCTION_FRONTEND_ORIGIN);

        // 2. Parse and normalize configured origins from environment / properties
        if (corsAllowedOriginsRaw != null && !corsAllowedOriginsRaw.trim().isEmpty()) {
            for (String o : corsAllowedOriginsRaw.split(",")) {
                String normalized = normalizeOrigin(o);
                if (normalized != null && !normalized.isEmpty() && !origins.contains(normalized)) {
                    origins.add(normalized);
                }
            }
        }

        // 3. Always allow local development origins
        List<String> localDevOrigins = List.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        );
        for (String devOrigin : localDevOrigins) {
            if (!origins.contains(devOrigin)) {
                origins.add(devOrigin);
            }
        }

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private String normalizeOrigin(String origin) {
        if (origin == null) return null;
        String trimmed = origin.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
