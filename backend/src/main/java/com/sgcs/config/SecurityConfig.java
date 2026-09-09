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

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/admin/users", "/api/admin/wards").hasAnyAuthority("ADMIN", "ROLE_ADMIN", "COUNCILLOR", "ROLE_COUNCILLOR")
                .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/complaints").hasAnyAuthority("CITIZEN", "ROLE_CITIZEN", "COUNCILLOR", "ROLE_COUNCILLOR", "WORKER", "ROLE_WORKER", "ADMIN", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/proposals/*/vote").hasAnyAuthority("CITIZEN", "ROLE_CITIZEN", "COUNCILLOR", "ROLE_COUNCILLOR", "WORKER", "ROLE_WORKER", "ADMIN", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/complaints/**", "/api/proposals/**", "/api/notices/**").hasAnyAuthority("COUNCILLOR", "ROLE_COUNCILLOR", "WORKER", "ROLE_WORKER", "ADMIN", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/complaints/**", "/api/proposals/**", "/api/notices/**").hasAnyAuthority("COUNCILLOR", "ROLE_COUNCILLOR", "WORKER", "ROLE_WORKER", "ADMIN", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/complaints/**", "/api/proposals/**", "/api/notices/**").hasAnyAuthority("COUNCILLOR", "ROLE_COUNCILLOR", "WORKER", "ROLE_WORKER", "ADMIN", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/complaints/**", "/api/proposals/**", "/api/notices/**").authenticated()
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
