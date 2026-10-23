package com.sgcs.security;

import com.sgcs.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    public static final String ISSUER = "SGCS";

    @Value("${sgcs.app.jwtSecret}")
    private String jwtSecret;

    // Requirement 5: Reduce token lifetime to 8h (8 * 3600 * 1000 = 28800000 ms)
    @Value("${sgcs.app.jwtExpirationMs:28800000}")
    private long jwtExpirationMs = 28800000L;

    // Requirement 6: fail startup if sgcs.app.jwtSecret is shorter than 32 bytes
    @PostConstruct
    public void init() {
        validateSecret(this.jwtSecret);
    }

    public void validateSecret(String secret) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("sgcs.app.jwtSecret must be at least 32 bytes (256 bits) for HMAC-SHA256 security. Refusing to start.");
        }
    }

    public void setJwtSecret(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getId())
                .issuer(ISSUER) // Requirement 6: Add iss claim
                .claim("id", user.getId())
                .claim("fullName", user.getFullName())
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .claim("ward", user.getWard())
                .claim("phone", user.getPhone() != null ? user.getPhone() : "")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .requireIssuer(ISSUER) // Requirement 6: verify iss claim
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .requireIssuer(ISSUER) // Requirement 6: verify iss claim
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
