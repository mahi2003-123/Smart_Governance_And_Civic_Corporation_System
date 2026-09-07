package com.sgcs.service;

import com.sgcs.dto.AuthDto;
import com.sgcs.entity.User;
import com.sgcs.repository.UserRepository;
import com.sgcs.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        String email = request.getEmail().trim();
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
        return new AuthDto.AuthResponse(true, user, token);
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new RuntimeException("Email address is already registered in SGCS database.");
        }

        User user = new User();
        user.setId("usr_" + System.currentTimeMillis());
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        user.setRole(request.getRole() != null ? request.getRole() : "CITIZEN");
        user.setWard(request.getWard() != null ? request.getWard() : "Ward 1 - Central Town");
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        String token = jwtUtils.generateToken(saved);

        return new AuthDto.AuthResponse(true, saved, token);
    }
}
