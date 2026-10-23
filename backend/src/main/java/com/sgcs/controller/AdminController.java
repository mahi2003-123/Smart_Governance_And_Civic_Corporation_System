package com.sgcs.controller;

import com.sgcs.dto.CreateUserRequest;
import com.sgcs.dto.WorkerSummaryDto;
import com.sgcs.entity.User;
import com.sgcs.entity.Ward;
import com.sgcs.exception.BadRequestException;
import com.sgcs.security.AccessGuard;
import com.sgcs.security.UserPrincipal;
import com.sgcs.service.AdminService;
import com.sgcs.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private AccessGuard accessGuard;

    // Rule F: GET /api/admin/users must be ADMIN-only
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // Rule F: separate GET /api/admin/workers (id, fullName, ward, specialization only) for councillors to pick workers in their own ward
    @GetMapping("/workers")
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNCILLOR')")
    public ResponseEntity<List<WorkerSummaryDto>> getWorkers(@RequestParam(required = false) String ward) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (auth != null && auth.getPrincipal() instanceof UserPrincipal p) ? p : null;

        List<User> allUsers = adminService.getAllUsers();
        String filterWard = ward;
        if (principal != null && "COUNCILLOR".equalsIgnoreCase(principal.getRole())) {
            filterWard = principal.getWard();
        }

        final String targetWard = filterWard;
        List<WorkerSummaryDto> workers = allUsers.stream()
                .filter(u -> "WORKER".equalsIgnoreCase(u.getRole()))
                .filter(u -> u.getStatus() == null || "ACTIVE".equalsIgnoreCase(u.getStatus()))
                .filter(u -> targetWard == null || targetWard.trim().isEmpty() || targetWard.equalsIgnoreCase("ALL") || accessGuard.isSameWard(u.getWard(), targetWard))
                .map(u -> new WorkerSummaryDto(u.getId(), u.getFullName(), u.getWard(), u.getSpecialization() != null ? u.getSpecialization() : "General"))
                .toList();

        return ResponseEntity.ok(workers);
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserRequest request) {
        User created = adminService.createUser(request, getCurrentUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body != null ? body.getOrDefault("status", "INACTIVE") : "INACTIVE";
        User updated = adminService.updateUserStatus(id, status, getCurrentUser());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/users/{id}/ward")
    public ResponseEntity<User> updateUserWard(@PathVariable String id, @RequestBody Map<String, String> body) {
        String ward = body != null ? body.get("ward") : null;
        if (ward == null || ward.trim().isEmpty()) {
            throw new BadRequestException("Ward is required");
        }
        User updated = adminService.updateUserWard(id, ward, getCurrentUser());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        adminService.deleteUser(id, getCurrentUser());
        return ResponseEntity.ok(Map.of("message", "Single user successfully deleted from PostgreSQL database.", "id", id));
    }

    @GetMapping("/wards")
    public ResponseEntity<List<Ward>> getAllWards() {
        return ResponseEntity.ok(adminService.getAllWards());
    }

    @PostMapping("/wards")
    public ResponseEntity<Ward> createWard(@Valid @RequestBody Ward ward) {
        Ward created = adminService.createWard(ward);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(auditService.getAllActivities());
    }
    
    @GetMapping("/activities")
    public ResponseEntity<?> getActivities() {
        return ResponseEntity.ok(auditService.getAllActivities());
    }

    private UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }
}
