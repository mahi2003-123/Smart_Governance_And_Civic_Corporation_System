package com.sgcs.controller;

import com.sgcs.config.FirebaseConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lightweight health and diagnostic endpoints.
 * Render uses /api/health as healthCheckPath.
 * /api/system-status is restricted to ADMIN and does not expose internal service URLs.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${ai.service.url:}")
    private String aiServiceUrl;

    @Value("${firebase.enabled:false}")
    private boolean firebaseEnabled;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @GetMapping("/system-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> systemStatus() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "firebaseReady", FirebaseConfig.isInitialized(),
            "firebaseEnabledFlag", firebaseEnabled,
            "timestamp", System.currentTimeMillis()
        ));
    }
}
