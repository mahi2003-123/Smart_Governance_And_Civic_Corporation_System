package com.sgcs.service;

import com.sgcs.dto.AuthDto;
import com.sgcs.entity.User;
import com.sgcs.exception.BadRequestException;
import com.sgcs.repository.UserRepository;
import com.sgcs.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditService auditService;

    @Autowired
    private com.sgcs.security.LoginRateLimiter loginRateLimiter;

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        return login(request, "127.0.0.1");
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request, String clientIp) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String password = request.getPassword(); // Requirement 3: Do NOT trim passwords

        // Requirement 4: Rate limit check (max 5 failed attempts per email+IP per 15 min, then 429)
        loginRateLimiter.checkRateLimit(email, clientIp);

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            handleFailedLogin(email, clientIp);
            throw new BadRequestException("Invalid email or password.");
        }

        User user = userOpt.get();

        // Requirement 4: reject users whose status is not ACTIVE with generic message
        if (user.getStatus() != null && !"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            handleFailedLogin(email, clientIp);
            throw new BadRequestException("Invalid email or password.");
        }

        if (password == null || !passwordEncoder.matches(password, user.getPassword())) {
            handleFailedLogin(email, clientIp);
            throw new BadRequestException("Invalid email or password.");
        }

        // Login success: clear failed attempts
        loginRateLimiter.clear(email, clientIp);

        String token = jwtUtils.generateToken(user);

        auditService.logActivity(
            user.getId(),
            user.getFullName(),
            user.getRole(),
            "User Login",
            "AUTH",
            user.getEmail(),
            "User " + user.getFullName() + " (" + user.getRole() + ") logged into SGCS portal"
        );

        return new AuthDto.AuthResponse(true, user, token);
    }

    private void handleFailedLogin(String email, String clientIp) {
        loginRateLimiter.recordFailedAttempt(email, clientIp);
        try {
            // Requirement 4: small constant-time-ish delay on failure
            Thread.sleep(150);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        
        // Requirement 10: Registration should not reveal whether an email exists (generic message)
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Unable to complete registration with the provided details. If you already have an account, please log in.");
        }

        // Requirement 3: Password policy for register: min 8 chars, 1 letter, 1 number. Do NOT trim passwords.
        String rawPassword = request.getPassword();
        com.sgcs.security.PasswordPolicy.validate(rawPassword);

        // Phone validation
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String cleanPhone = request.getPhone().replaceAll("[\\s\\-\\+]", "");
            if (!cleanPhone.matches("^[0-9]{10,15}$")) {
                throw new BadRequestException("Phone number must be a valid number of 10 to 15 digits.");
            }
        }

        String role = "CITIZEN";
        String ward = request.getWard() != null ? request.getWard() : "Ward 1 - Central Town";

        // Enforce 1 Councillor per ward constraint
        if ("COUNCILLOR".equalsIgnoreCase(role) && ward != null && !ward.equalsIgnoreCase("All Wards")) {
            List<User> allCouncillors = userRepository.findByRoleIgnoreCase("COUNCILLOR");
            for (User c : allCouncillors) {
                if (c.getWard() != null && isSameWard(c.getWard(), ward)) {
                    throw new BadRequestException("Ward \"" + ward + "\" already has an assigned Ward Councillor (" + c.getFullName() + " - " + c.getEmail() + "). Only 1 Councillor is permitted per municipal ward.");
                }
            }
        }

        User user = new User();
        user.setId("usr_" + UUID.randomUUID().toString());
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        user.setRole(role);
        user.setWard(ward);
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        String token = jwtUtils.generateToken(saved);

        auditService.logActivity(
            saved.getId(),
            saved.getFullName(),
            saved.getRole(),
            "User Self-Registration",
            "AUTH",
            saved.getEmail(),
            "Registered new account with role " + saved.getRole() + " in " + saved.getWard()
        );

        return new AuthDto.AuthResponse(true, saved, token);
    }

    public AuthDto.AuthResponse updateProfile(String userId, AuthDto.UpdateProfileRequest request) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new BadRequestException("User not found.");
        }
        User user = userOpt.get();
        
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String cleanPhone = request.getPhone().replaceAll("[\\s\\-\\+]", "");
            if (!cleanPhone.matches("^[0-9]{10,15}$")) {
                throw new BadRequestException("Phone number must be a valid number of 10 to 15 digits.");
            }
            user.setPhone(request.getPhone().trim());
        }
        // Requirement 7: remove the ability to change ward. Only ADMIN can change ward via admin endpoint.
        // Any ward value sent in request is strictly ignored.
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        
        User saved = userRepository.save(user);
        
        auditService.logActivity(
            saved.getId(),
            saved.getFullName(),
            saved.getRole(),
            "Profile Update",
            "AUTH",
            saved.getEmail(),
            "User updated their profile (phone: " + saved.getPhone() + ")"
        );
        
        return new AuthDto.AuthResponse(true, saved, null);
    }

    private boolean isSameWard(String wardA, String wardB) {
        if (wardA == null || wardB == null) return false;
        String a = wardA.trim().toLowerCase();
        String b = wardB.trim().toLowerCase();
        if (a.equals(b)) return true;

        if (a.contains("ward ") && b.contains("ward ")) {
            String numA = a.substring(a.indexOf("ward ") + 5).split(" ")[0].split("-")[0].trim();
            String numB = b.substring(b.indexOf("ward ") + 5).split(" ")[0].split("-")[0].trim();
            if (!numA.isEmpty() && numA.equals(numB)) {
                return true;
            }
        }
        return false;
    }
}
