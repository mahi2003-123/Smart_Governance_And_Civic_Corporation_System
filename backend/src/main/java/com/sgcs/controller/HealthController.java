package com.sgcs.controller;

import com.sgcs.config.FirebaseConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lightweight health and diagnostic endpoints.
 * Render uses /api/health as healthCheckPath.
 * /api/system-status exposes safe runtime status (Firebase readiness, AI URL).
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${ai.service.url:https://smart-governance-and-civic-corporation-7q2c.onrender.com}")
    private String aiServiceUrl;

    @Value("${firebase.enabled:false}")
    private boolean firebaseEnabled;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @GetMapping("/system-status")
    public ResponseEntity<Map<String, Object>> systemStatus() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "firebaseReady", FirebaseConfig.isInitialized(),
            "firebaseEnabledFlag", firebaseEnabled,
            "aiServiceUrl", aiServiceUrl != null ? aiServiceUrl : "unconfigured",
            "timestamp", System.currentTimeMillis()
        ));
    }
}
