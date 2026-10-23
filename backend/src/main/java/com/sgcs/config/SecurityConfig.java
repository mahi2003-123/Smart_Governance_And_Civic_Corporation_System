package com.sgcs.config;

import com.sgcs.security.JwtAccessDeniedHandler;
import com.sgcs.security.JwtAuthenticationEntryPoint;
import com.sgcs.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Autowired
    private org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .headers(headers -> headers
                .contentTypeOptions(Customizer.withDefaults())
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                // Allow all preflight OPTIONS requests before authentication checks
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Public endpoints
                .requestMatchers("/api/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/complaints/track/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/wards/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()

                // Admin-only system status
                .requestMatchers("/api/system-status").hasRole("ADMIN")

                // Predict category requires authenticated user
                .requestMatchers("/api/complaints/predict-category").hasAnyRole("CITIZEN", "COUNCILLOR", "ADMIN")

                // Bulk Delete Endpoints (ADMIN only)
                .requestMatchers(HttpMethod.DELETE, "/api/complaints", "/api/proposals", "/api/notices", "/api/notifications").hasRole("ADMIN")

                // Admin Endpoints
                .requestMatchers(HttpMethod.GET, "/api/admin/workers", "/api/admin/wards").hasAnyRole("ADMIN", "COUNCILLOR")
                .requestMatchers(HttpMethod.GET, "/api/admin/users").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Fine-grained Complaints Endpoints
                .requestMatchers(HttpMethod.POST, "/api/complaints").hasRole("CITIZEN")
                .requestMatchers(HttpMethod.POST, "/api/complaints/*/start", "/api/complaints/*/complete", "/api/complaints/*/delay").hasAnyRole("WORKER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/start", "/api/complaints/*/complete", "/api/complaints/*/delay").hasAnyRole("WORKER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/complaints/*/approve", "/api/complaints/*/reject-proof").hasAnyRole("COUNCILLOR", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/approve", "/api/complaints/*/reject-proof").hasAnyRole("COUNCILLOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/complaints/*/assign", "/api/complaints/*/ai-category", "/api/complaints/*/link-duplicate").hasAnyRole("COUNCILLOR", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/assign", "/api/complaints/*/ai-category", "/api/complaints/*/link-duplicate").hasAnyRole("COUNCILLOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/complaints/*/comment", "/api/complaints/*/comments").hasAnyRole("CITIZEN", "WORKER", "COUNCILLOR", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/status").hasAnyRole("WORKER", "COUNCILLOR", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/priority").hasAnyRole("COUNCILLOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/complaints/**").hasRole("ADMIN")

                // Proposals Endpoints
                .requestMatchers(HttpMethod.POST, "/api/proposals").hasAnyRole("CITIZEN", "COUNCILLOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/proposals/*/vote").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/proposals/*/comment", "/api/proposals/*/comments").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/proposals/*/review", "/api/proposals/*/status").hasAnyRole("COUNCILLOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/proposals/**").hasRole("ADMIN")

                // Notices Endpoints (WORKER removed)
                .requestMatchers(HttpMethod.POST, "/api/notices", "/api/notices/**").hasAnyRole("COUNCILLOR", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/notices/**").hasAnyRole("COUNCILLOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/notices/**").hasAnyRole("COUNCILLOR", "ADMIN")

                // Notifications Endpoints (Public POST removed, deny client creation)
                .requestMatchers(HttpMethod.POST, "/api/notifications").denyAll()
                .requestMatchers(HttpMethod.PATCH, "/api/notifications/*/read", "/api/notifications/read-all").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/notifications/device-token").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/notifications/**").hasRole("ADMIN")

                // Authenticated GET requests
                .requestMatchers(HttpMethod.GET, "/api/complaints/**", "/api/proposals/**", "/api/notices/**", "/api/notifications/**").authenticated()
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
