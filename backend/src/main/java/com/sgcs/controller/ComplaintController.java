package com.sgcs.controller;

import com.sgcs.entity.Complaint;
import com.sgcs.security.UserPrincipal;
import com.sgcs.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    private UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getAllComplaints(
            @RequestParam(required = false) String citizenId,
            @RequestParam(required = false) String ward) {

        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String role = principal.getRole();

        if ("WORKER".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(complaintService.getComplaintsForWorker(principal.getId(), principal.getFullName(), principal.getEmail(), principal.getWard()));
        }

        if (citizenId != null && !citizenId.isEmpty()) {
            if ("CITIZEN".equalsIgnoreCase(role) && !principal.getId().equals(citizenId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: You can only view your own complaints"));
            }
            return ResponseEntity.ok(complaintService.getComplaintsByCitizen(citizenId));
        }

        if (ward != null && !ward.isEmpty()) {
            if (!"ADMIN".equalsIgnoreCase(role)) {
                if (principal.getWard() != null && !ward.equalsIgnoreCase(principal.getWard())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied: You can only view complaints for your assigned ward"));
                }
            }
            return ResponseEntity.ok(complaintService.getComplaintsByWard(ward));
        }

        // Default filters based on caller role if no explicit param passed
        if ("CITIZEN".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(complaintService.getComplaintsByCitizen(principal.getId()));
        } else if ("COUNCILLOR".equalsIgnoreCase(role)) {
            if (principal.getWard() != null && !principal.getWard().isEmpty()) {
                return ResponseEntity.ok(complaintService.getComplaintsByWard(principal.getWard()));
            }
        }

        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintById(@PathVariable String id) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        var opt = complaintService.getComplaintById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Complaint complaint = opt.get();
        String role = principal.getRole();

        if ("CITIZEN".equalsIgnoreCase(role)) {
            if (!principal.getId().equals(complaint.getCitizenId()) && !id.equalsIgnoreCase(complaint.getTrackingNumber())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: You can only view your own complaints"));
            }
        }

        return ResponseEntity.ok(complaint);
    }

    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody Complaint complaint) {
        UserPrincipal principal = getCurrentUser();
        if (principal != null && "CITIZEN".equalsIgnoreCase(principal.getRole())) {
            complaint.setCitizenId(principal.getId());
            if (complaint.getCitizenName() == null || complaint.getCitizenName().isEmpty()) {
                complaint.setCitizenName(principal.getFullName());
            }
        }

        try {
            Complaint created = complaintService.createComplaint(complaint);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        var opt = complaintService.getComplaintById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Complaint not found"));
        }

        Complaint complaint = opt.get();
        String role = principal.getRole();

        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        boolean isAssignedWorker = principal.getId().equals(complaint.getAssignedWorkerId());
        boolean isWardCouncillor = "COUNCILLOR".equalsIgnoreCase(role) && principal.getWard() != null && principal.getWard().equalsIgnoreCase(complaint.getWard());

        if (!isAdmin && !isAssignedWorker && !isWardCouncillor) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Only assigned worker, ward councillor, or admin can update status"));
        }

        try {
            String status = body.get("status");
            Complaint updated = complaintService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<?> assignWorker(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        var opt = complaintService.getComplaintById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Complaint not found"));
        }

        Complaint complaint = opt.get();
        String role = principal.getRole();

        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        boolean isCouncillor = "COUNCILLOR".equalsIgnoreCase(role);

        if (!isAdmin && !isCouncillor) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Only ward councillor or admin can assign workers"));
        }

        try {
            Complaint updated = complaintService.assignWorker(id, body);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startTask(@PathVariable String id) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            Complaint updated = complaintService.startTask(id, principal.getId(), principal.getFullName());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeTask(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            String notes = body.get("notes");
            String afterImage = body.get("afterImage") != null ? body.get("afterImage") : body.get("completionImage");
            String beforeImage = body.get("beforeImage");

            Complaint updated = complaintService.completeTask(id, principal.getId(), principal.getFullName(), notes, afterImage, beforeImage);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveTask(@PathVariable String id) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            Complaint updated = complaintService.approveTask(id, principal.getId(), principal.getFullName());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject-proof")
    public ResponseEntity<?> rejectTaskProof(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            String feedback = body != null ? body.get("feedback") : "Evidence insufficient";
            Complaint updated = complaintService.rejectTaskProof(id, principal.getId(), principal.getFullName(), feedback);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/delay")
    public ResponseEntity<?> reportDelay(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            String reason = body.get("reason");
            String notes = body.get("notes");
            String delayImage = body.get("delayImage");

            Complaint updated = complaintService.reportDelay(id, principal.getId(), principal.getFullName(), reason, notes, delayImage);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping({"/{id}/comment", "/{id}/comments"})
    public ResponseEntity<?> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            String content = body.get("content");
            String authorName = body.get("authorName") != null ? body.get("authorName") : principal.getFullName();
            String authorRole = body.get("authorRole") != null ? body.get("authorRole") : principal.getRole();
            String authorAvatar = body.get("authorAvatar");

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Comment content cannot be empty"));
            }

            Complaint updated = complaintService.addComment(id, authorName, authorRole, content.trim(), authorAvatar);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable String id) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null || !"ADMIN".equalsIgnoreCase(principal.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: Only admin can delete complaints"));
        }
        try {
            complaintService.deleteComplaint(id);
            return ResponseEntity.ok(Map.of("message", "Complaint deleted successfully", "id", id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllComplaints(@RequestBody(required = false) Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null || !"ADMIN".equalsIgnoreCase(principal.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: Only admin can delete all complaints"));
        }

        if (body == null || !"DELETE_ALL".equals(body.get("confirm"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Confirmation 'DELETE_ALL' required in body to delete all complaints"));
        }

        complaintService.deleteAllComplaints();
        return ResponseEntity.ok(Map.of("message", "All complaints cleared successfully"));
    }
}
