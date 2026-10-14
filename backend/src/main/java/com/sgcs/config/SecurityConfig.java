package com.sgcs.config;

import com.sgcs.security.JwtAccessDeniedHandler;
import com.sgcs.security.JwtAuthenticationEntryPoint;
import com.sgcs.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
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
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                // Explicitly allow all preflight OPTIONS requests before authentication checks
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/health", "/api/system-status").permitAll()
                .requestMatchers("/api/auth/**").permitAll()

                // Section 2: Bulk Delete Endpoints (ADMIN only)
                .requestMatchers(HttpMethod.DELETE, "/api/complaints", "/api/proposals", "/api/notices", "/api/notifications").hasRole("ADMIN")

                // Admin Endpoints
                .requestMatchers(HttpMethod.GET, "/api/admin/users", "/api/admin/wards").hasAnyRole("ADMIN", "COUNCILLOR")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Complaints Endpoints
                .requestMatchers(HttpMethod.POST, "/api/complaints", "/api/complaints/**").hasAnyRole("CITIZEN", "COUNCILLOR", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/complaints/**").hasAnyRole("CITIZEN", "COUNCILLOR", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/complaints/**").hasAnyRole("COUNCILLOR", "WORKER", "ADMIN")

                // Proposals Endpoints
                .requestMatchers(HttpMethod.POST, "/api/proposals", "/api/proposals/**").hasAnyRole("CITIZEN", "COUNCILLOR", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/proposals/**").hasAnyRole("CITIZEN", "COUNCILLOR", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/proposals/**").hasAnyRole("COUNCILLOR", "WORKER", "ADMIN")

                // Notices Endpoints
                .requestMatchers(HttpMethod.POST, "/api/notices", "/api/notices/**").hasAnyRole("COUNCILLOR", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/notices/**").hasAnyRole("COUNCILLOR", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/notices/**").hasAnyRole("COUNCILLOR", "WORKER", "ADMIN")

                // Notifications Endpoints
                .requestMatchers(HttpMethod.POST, "/api/notifications", "/api/notifications/**").hasAnyRole("CITIZEN", "COUNCILLOR", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/notifications/**").hasAnyRole("CITIZEN", "COUNCILLOR", "WORKER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/notifications/**").hasAnyRole("COUNCILLOR", "WORKER", "ADMIN")

                // Authenticated GET requests
                .requestMatchers(HttpMethod.GET, "/api/complaints/**", "/api/proposals/**", "/api/notices/**", "/api/notifications/**").authenticated()
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
