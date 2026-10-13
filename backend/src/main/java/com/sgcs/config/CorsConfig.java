package com.sgcs.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

/**
 * Single CORS configuration bean (removes duplicate WebMvcConfigurer bean).
 * Allowed origins are read from the env variable CORS_ALLOWED_ORIGINS
 * (comma-separated).  Defaults include localhost:5173 for local development.
 */
@Configuration
public class CorsConfig {

    /**
     * Comma-separated list of allowed origins, e.g.:
     *   https://sgcs.vercel.app,https://sgcs-staging.vercel.app
     * Set via CORS_ALLOWED_ORIGINS environment variable in Render dashboard.
     */
    @Value("${cors.allowed.origins:http://localhost:5173}")
    private String corsAllowedOriginsRaw;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = new ArrayList<>();
        if (corsAllowedOriginsRaw != null && !corsAllowedOriginsRaw.trim().isEmpty()) {
            for (String o : corsAllowedOriginsRaw.split(",")) {
                String trimmed = o.trim();
                if (!trimmed.isEmpty()) {
                    origins.add(trimmed);
                }
            }
        }
        // Always allow localhost for development convenience
        if (!origins.contains("http://localhost:5173")) {
            origins.add("http://localhost:5173");
        }
        if (!origins.contains("http://127.0.0.1:5173")) {
            origins.add("http://127.0.0.1:5173");
        }

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
