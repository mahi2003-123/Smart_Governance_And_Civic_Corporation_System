package com.sgcs.controller;

import com.sgcs.entity.Complaint;
import com.sgcs.exception.BadRequestException;
import com.sgcs.exception.ResourceNotFoundException;
import com.sgcs.security.UserPrincipal;
import com.sgcs.service.ComplaintService;
import jakarta.validation.Valid;
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
                throw new AccessDeniedException("Access denied: You can only view your own complaints");
            }
            return ResponseEntity.ok(complaintService.getComplaintsByCitizen(citizenId));
        }

        if (ward != null && !ward.isEmpty()) {
            if (!"ADMIN".equalsIgnoreCase(role)) {
                if (principal.getWard() != null && !ward.equalsIgnoreCase(principal.getWard())) {
                    throw new AccessDeniedException("Access denied: You can only view complaints for your assigned ward");
                }
            }
            return ResponseEntity.ok(complaintService.getComplaintsByWard(ward));
        }

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

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found: " + id));

        String role = principal.getRole();
        if ("CITIZEN".equalsIgnoreCase(role)) {
            if (!principal.getId().equals(complaint.getCitizenId()) && !id.equalsIgnoreCase(complaint.getTrackingNumber())) {
                throw new AccessDeniedException("Access denied: You can only view your own complaints");
            }
        }

        return ResponseEntity.ok(complaint);
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@Valid @RequestBody Complaint complaint) {
        UserPrincipal principal = getCurrentUser();
        if (principal != null && "CITIZEN".equalsIgnoreCase(principal.getRole())) {
            complaint.setCitizenId(principal.getId());
            if (complaint.getCitizenName() == null || complaint.getCitizenName().isEmpty()) {
                complaint.setCitizenName(principal.getFullName());
            }
        }

        Complaint created = complaintService.createComplaint(complaint);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        String role = principal.getRole();
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        boolean isAssignedWorker = principal.getId().equals(complaint.getAssignedWorkerId());
        boolean isWardCouncillor = "COUNCILLOR".equalsIgnoreCase(role) && principal.getWard() != null && principal.getWard().equalsIgnoreCase(complaint.getWard());

        if (!isAdmin && !isAssignedWorker && !isWardCouncillor) {
            throw new AccessDeniedException("Access denied: Only assigned worker, ward councillor, or admin can update status");
        }

        String status = body != null ? body.get("status") : null;
        Complaint updated = complaintService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<Complaint> updatePriority(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String priority = body != null ? body.get("priority") : null;
        Complaint updated = complaintService.updatePriority(id, priority, principal.getId(), principal.getFullName(), principal.getRole(), principal.getWard());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Complaint> assignWorker(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        String role = principal.getRole();
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        boolean isCouncillor = "COUNCILLOR".equalsIgnoreCase(role);

        if (!isAdmin && !isCouncillor) {
            throw new AccessDeniedException("Access denied: Only ward councillor or admin can assign workers");
        }

        Complaint updated = complaintService.assignWorker(id, body);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Complaint> startTask(@PathVariable String id) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint updated = complaintService.startTask(id, principal.getId(), principal.getFullName());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Complaint> completeTask(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String notes = body != null ? body.get("notes") : null;
        String afterImage = body != null ? (body.get("afterImage") != null ? body.get("afterImage") : body.get("completionImage")) : null;
        String beforeImage = body != null ? body.get("beforeImage") : null;

        Complaint updated = complaintService.completeTask(id, principal.getId(), principal.getFullName(), notes, afterImage, beforeImage);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Complaint> approveTask(@PathVariable String id) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint updated = complaintService.approveTask(id, principal.getId(), principal.getFullName());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/reject-proof")
    public ResponseEntity<Complaint> rejectTaskProof(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String feedback = body != null ? body.get("feedback") : "Evidence insufficient";
        Complaint updated = complaintService.rejectTaskProof(id, principal.getId(), principal.getFullName(), feedback);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/delay")
    public ResponseEntity<Complaint> reportDelay(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String reason = body != null ? body.get("reason") : null;
        String notes = body != null ? body.get("notes") : null;
        String delayImage = body != null ? body.get("delayImage") : null;

        Complaint updated = complaintService.reportDelay(id, principal.getId(), principal.getFullName(), reason, notes, delayImage);
        return ResponseEntity.ok(updated);
    }

    @PostMapping({"/{id}/comment", "/{id}/comments"})
    public ResponseEntity<Complaint> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String content = body != null ? body.get("content") : null;
        String authorName = body != null && body.get("authorName") != null ? body.get("authorName") : principal.getFullName();
        String authorRole = body != null && body.get("authorRole") != null ? body.get("authorRole") : principal.getRole();
        String authorAvatar = body != null ? body.get("authorAvatar") : null;

        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Comment content cannot be empty");
        }

        Complaint updated = complaintService.addComment(id, authorName, authorRole, content.trim(), authorAvatar);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable String id) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null || !"ADMIN".equalsIgnoreCase(principal.getRole())) {
            throw new AccessDeniedException("Access denied: Only admin can delete complaints");
        }

        complaintService.deleteComplaint(id);
        return ResponseEntity.ok(Map.of("message", "Complaint deleted successfully", "id", id));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllComplaints(@RequestBody(required = false) Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null || !"ADMIN".equalsIgnoreCase(principal.getRole())) {
            throw new AccessDeniedException("Access denied: Only admin can delete all complaints");
        }

        if (body == null || !"DELETE_ALL".equals(body.get("confirm"))) {
            throw new BadRequestException("Confirmation 'DELETE_ALL' required in body to delete all complaints");
        }

        complaintService.deleteAllComplaints();
        return ResponseEntity.ok(Map.of("message", "All complaints cleared successfully"));
    }

    @PostMapping("/{id}/ai-category")
    public ResponseEntity<?> reviewAiCategory(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null || (!"COUNCILLOR".equalsIgnoreCase(principal.getRole()) && !"ADMIN".equalsIgnoreCase(principal.getRole()))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Only councillor or admin can review AI category"));
        }
        
        String category = body.get("category");
        if (category == null || category.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category is required"));
        }
        
        Complaint updated = complaintService.reviewAiCategory(id, category, principal.getId(), principal.getFullName());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/link-duplicate")
    public ResponseEntity<?> linkDuplicate(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null || (!"COUNCILLOR".equalsIgnoreCase(principal.getRole()) && !"ADMIN".equalsIgnoreCase(principal.getRole()))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Only councillor or admin can link duplicates"));
        }
        
        boolean isDuplicate = Boolean.parseBoolean(body.get("isDuplicate"));
        String masterId = body.get("masterId");
        
        if (isDuplicate && (masterId == null || masterId.trim().isEmpty())) {
            return ResponseEntity.badRequest().body(Map.of("error", "masterId is required if isDuplicate is true"));
        }
        
        Complaint updated = complaintService.linkDuplicate(id, masterId, isDuplicate, principal.getId(), principal.getFullName());
        return ResponseEntity.ok(updated);
    }
}
