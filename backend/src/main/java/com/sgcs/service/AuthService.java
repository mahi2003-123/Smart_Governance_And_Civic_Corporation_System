package com.sgcs.service;

import com.sgcs.dto.AuthDto;
import com.sgcs.entity.User;
import com.sgcs.repository.UserRepository;
import com.sgcs.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String password = request.getPassword().trim();

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password.");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

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

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new RuntimeException("Email address is already registered in SGCS database.");
        }

        String role = request.getRole() != null ? request.getRole() : "CITIZEN";
        String ward = request.getWard() != null ? request.getWard() : "Ward 1 - Central Town";

        // Enforce 1 Councillor per ward constraint
        if ("COUNCILLOR".equalsIgnoreCase(role) && ward != null && !ward.equalsIgnoreCase("All Wards")) {
            List<User> allCouncillors = userRepository.findByRoleIgnoreCase("COUNCILLOR");
            for (User c : allCouncillors) {
                if (c.getWard() != null && isSameWard(c.getWard(), ward)) {
                    throw new RuntimeException("Ward \"" + ward + "\" already has an assigned Ward Councillor (" + c.getFullName() + " - " + c.getEmail() + "). Only 1 Councillor is permitted per municipal ward.");
                }
            }
        }

        User user = new User();
        user.setId("usr_" + System.currentTimeMillis());
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        user.setRole(role);
        user.setWard(ward);
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
