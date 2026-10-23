package com.sgcs.controller;

import com.sgcs.dto.AuthDto;
import com.sgcs.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest request, HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        AuthDto.AuthResponse response = authService.login(request, clientIp);
        return ResponseEntity.ok(response);
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.trim().isEmpty()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        AuthDto.AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthDto.AuthResponse> updateProfile(@RequestBody AuthDto.UpdateProfileRequest request) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof com.sgcs.security.UserPrincipal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        com.sgcs.security.UserPrincipal principal = (com.sgcs.security.UserPrincipal) auth.getPrincipal();
        
        AuthDto.AuthResponse response = authService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
