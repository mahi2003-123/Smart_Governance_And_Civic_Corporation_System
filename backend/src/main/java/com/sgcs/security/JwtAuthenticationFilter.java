package com.sgcs.security;

import com.sgcs.entity.User;
import com.sgcs.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    private static class CachedUser {
        final User user;
        final long timestamp;
        CachedUser(User user, long timestamp) {
            this.user = user;
            this.timestamp = timestamp;
        }
    }

    private static final ConcurrentHashMap<String, CachedUser> userCache = new ConcurrentHashMap<>();

    public static void clearCache() {
        userCache.clear();
    }

    public static void evictUser(String userId) {
        if (userId != null) {
            userCache.remove(userId);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Fast-path bypass: preflight OPTIONS requests do not carry JWT authentication
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateToken(jwt)) {
                Claims claims = jwtUtils.getClaimsFromToken(jwt);
                String userId = claims.get("id", String.class);
                if (userId == null || userId.trim().isEmpty()) {
                    userId = claims.getSubject();
                }

                if (userId != null && !userId.trim().isEmpty()) {
                    // Requirement 5: Load user from DB (cache for 60s)
                    long now = System.currentTimeMillis();
                    CachedUser cached = userCache.get(userId);
                    User user = null;
                    if (cached != null && (now - cached.timestamp < 60_000L)) {
                        user = cached.user;
                    } else {
                        Optional<User> userOpt = userRepository.findById(userId);
                        if (userOpt.isPresent()) {
                            user = userOpt.get();
                            userCache.put(userId, new CachedUser(user, now));
                        } else {
                            userCache.remove(userId);
                        }
                    }

                    // Reject if user is missing
                    if (user == null) {
                        SecurityContextHolder.clearContext();
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // Reject if user is not ACTIVE
                    if (user.getStatus() != null && !"ACTIVE".equalsIgnoreCase(user.getStatus())) {
                        SecurityContextHolder.clearContext();
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // Reject if role in DB differs from token
                    String tokenRole = claims.get("role", String.class);
                    String dbRole = user.getRole();
                    if (tokenRole != null && tokenRole.toUpperCase().startsWith("ROLE_")) {
                        tokenRole = tokenRole.substring(5);
                    }
                    if (dbRole != null && dbRole.toUpperCase().startsWith("ROLE_")) {
                        dbRole = dbRole.substring(5);
                    }
                    if (tokenRole != null && dbRole != null && !tokenRole.equalsIgnoreCase(dbRole)) {
                        SecurityContextHolder.clearContext();
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // Reject if ward in DB differs from token
                    String tokenWard = claims.get("ward", String.class);
                    String dbWard = user.getWard();
                    String normTokenWard = tokenWard != null ? tokenWard.trim().toLowerCase() : "";
                    String normDbWard = dbWard != null ? dbWard.trim().toLowerCase() : "";
                    if (!normTokenWard.equals(normDbWard)) {
                        SecurityContextHolder.clearContext();
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // Requirement 5: Use DB role and ward for principal, not token claims
                    String roleName = dbRole != null ? dbRole.toUpperCase() : "CITIZEN";
                    List<SimpleGrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_" + roleName)
                    );

                    UserPrincipal principal = new UserPrincipal(
                            user.getId(),
                            user.getFullName() != null ? user.getFullName() : "",
                            user.getEmail() != null ? user.getEmail() : "",
                            roleName,
                            user.getWard() != null ? user.getWard() : "",
                            user.getPhone() != null ? user.getPhone() : "",
                            authorities
                    );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(principal, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
