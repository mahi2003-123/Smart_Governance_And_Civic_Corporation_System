package com.sgcs.controller;

import com.sgcs.dto.CreateComplaintRequest;
import com.sgcs.dto.PublicComplaintStatusDto;
import com.sgcs.entity.Complaint;
import com.sgcs.entity.User;
import com.sgcs.exception.BadRequestException;
import com.sgcs.exception.ResourceNotFoundException;
import com.sgcs.repository.ComplaintRepository;
import com.sgcs.security.AccessGuard;
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

    @Autowired
    private AccessGuard accessGuard;

    @Autowired
    private com.sgcs.security.ImageValidator imageValidator;

    @Autowired
    private ComplaintRepository complaintRepository;

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

        // Rule A.5: Enforce server-side list authorization
        accessGuard.checkCanListComplaints(principal, citizenId, ward);

        String role = principal.getRole();

        if ("WORKER".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(complaintService.getComplaintsForWorker(principal.getId(), principal.getFullName(), principal.getEmail(), principal.getWard()));
        }

        if (citizenId != null && !citizenId.isEmpty()) {
            return ResponseEntity.ok(complaintService.getComplaintsByCitizen(citizenId));
        }

        if (ward != null && !ward.isEmpty()) {
            return ResponseEntity.ok(complaintService.getComplaintsByWard(ward));
        }

        if ("CITIZEN".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(complaintService.getComplaintsByCitizen(principal.getId()));
        } else if ("COUNCILLOR".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(complaintService.getComplaintsByWard(principal.getWard()));
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

        // Rule A.4: CITIZEN may read only their own complaint. WORKER only if assigned. COUNCILLOR only for their ward. ADMIN any.
        accessGuard.checkCanReadComplaint(principal, complaint);

        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<PublicComplaintStatusDto> trackComplaint(@PathVariable String trackingNumber) {
        Complaint complaint = complaintRepository.findByTrackingNumber(trackingNumber)
                .or(() -> complaintRepository.findById(trackingNumber))
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with tracking number: " + trackingNumber));

        return ResponseEntity.ok(new PublicComplaintStatusDto(complaint));
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@Valid @RequestBody CreateComplaintRequest request) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Rule A.7: Only CITIZEN may create complaints
        if (!"CITIZEN".equalsIgnoreCase(principal.getRole())) {
            throw new AccessDeniedException("Access denied: Only citizens may submit complaints");
        }

        // Rule A.7: Validate ward exists
        accessGuard.validateWardExists(request.getWard());

        // Requirement 4: Server-side validation of images
        imageValidator.validateComplaintImages(request.getImages());

        Complaint created = complaintService.createComplaint(request, principal);
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
        boolean isAdmin = accessGuard.isAdmin(principal);
        boolean isAssignedWorker = "WORKER".equalsIgnoreCase(role) && principal.getId().equals(complaint.getAssignedWorkerId());
        boolean isWardCouncillor = "COUNCILLOR".equalsIgnoreCase(role) && accessGuard.isSameWard(principal.getWard(), complaint.getWard());

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

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        accessGuard.checkCouncillorCanManageComplaint(principal, complaint, "update priority of");

        String priority = body != null ? body.get("priority") : null;
        Complaint updated = complaintService.updatePriority(id, priority, principal.getId(), principal.getFullName(), principal.getRole(), principal.getWard());
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/assign", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<Complaint> assignWorker(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Rule A.3: assign: only the councillor of complaint.ward, or ADMIN.
        accessGuard.checkCouncillorCanManageComplaint(principal, complaint, "assign worker to");

        // Rule A.3: check target workerId belongs to a user with role WORKER and is ACTIVE.
        String workerId = body != null ? body.get("workerId") : null;
        User targetWorker = accessGuard.validateActiveWorker(workerId);
        if (body != null) {
            body.put("workerName", targetWorker.getFullName());
        }

        Complaint updated = complaintService.assignWorker(id, body);
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/start", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<Complaint> startTask(@PathVariable String id) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Rule A.1: start: only the assigned worker or ADMIN.
        accessGuard.checkWorkerCanModifyTask(principal, complaint, "start");

        Complaint updated = complaintService.startTask(id, principal.getId(), principal.getFullName());
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/complete", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<Complaint> completeTask(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Rule A.1: complete: only the assigned worker or ADMIN.
        accessGuard.checkWorkerCanModifyTask(principal, complaint, "complete");

        String notes = body != null ? body.get("notes") : null;
        String afterImage = body != null ? (body.get("afterImage") != null ? body.get("afterImage") : body.get("completionImage")) : null;
        String beforeImage = body != null ? body.get("beforeImage") : null;

        // Requirement 4: Server-side validation of completion images
        imageValidator.validateSingleImage(afterImage, "afterImage");
        if (beforeImage != null && !beforeImage.trim().isEmpty()) {
            imageValidator.validateSingleImage(beforeImage, "beforeImage");
        }

        Complaint updated = complaintService.completeTask(id, principal.getId(), principal.getFullName(), notes, afterImage, beforeImage);
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/approve", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<Complaint> approveTask(@PathVariable String id) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Rule A.2: approve: only the COUNCILLOR whose ward equals complaint.ward, or ADMIN.
        accessGuard.checkCouncillorCanReviewProof(principal, complaint, "approve");

        Complaint updated = complaintService.approveTask(id, principal.getId(), principal.getFullName());
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/reject-proof", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<Complaint> rejectTaskProof(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Rule A.2: reject-proof: only the COUNCILLOR whose ward equals complaint.ward, or ADMIN.
        accessGuard.checkCouncillorCanReviewProof(principal, complaint, "reject proof for");

        String feedback = body != null ? body.get("feedback") : "Evidence insufficient";
        Complaint updated = complaintService.rejectTaskProof(id, principal.getId(), principal.getFullName(), feedback);
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/delay", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<Complaint> reportDelay(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Rule A.1: delay: only the assigned worker or ADMIN.
        accessGuard.checkWorkerCanModifyTask(principal, complaint, "report delay on");

        String reason = body != null ? body.get("reason") : null;
        String notes = body != null ? body.get("notes") : null;
        String delayImage = body != null ? body.get("delayImage") : null;

        // Requirement 4: Server-side validation of delay image
        if (delayImage != null && !delayImage.trim().isEmpty()) {
            imageValidator.validateSingleImage(delayImage, "delayImage");
        }

        Complaint updated = complaintService.reportDelay(id, principal.getId(), principal.getFullName(), reason, notes, delayImage);
        return ResponseEntity.ok(updated);
    }

    @PostMapping({"/{id}/comment", "/{id}/comments"})
    public ResponseEntity<Complaint> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Rule A.6: Comments: CITIZEN may comment only on own complaints, WORKER on assigned ones, COUNCILLOR on own ward.
        accessGuard.checkCanCommentComplaint(principal, complaint);

        String content = body != null ? body.get("content") : null;
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Comment content cannot be empty");
        }

        // Rule A.6: ignore authorName, authorRole and authorAvatar from the request body. Use principal's values.
        String authorName = principal.getFullName();
        String authorRole = principal.getRole();
        String authorAvatar = null;

        Complaint updated = complaintService.addComment(id, authorName, authorRole, content.trim(), authorAvatar);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable String id) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null || !accessGuard.isAdmin(principal)) {
            throw new AccessDeniedException("Access denied: Only admin can delete complaints");
        }

        complaintService.deleteComplaint(id);
        return ResponseEntity.ok(Map.of("message", "Complaint deleted successfully", "id", id));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllComplaints(@RequestBody(required = false) Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null || !accessGuard.isAdmin(principal)) {
            throw new AccessDeniedException("Access denied: Only admin can delete all complaints");
        }

        if (body == null || !"DELETE_ALL".equals(body.get("confirm"))) {
            throw new BadRequestException("Confirmation 'DELETE_ALL' required in body to delete all complaints");
        }

        complaintService.deleteAllComplaints();
        return ResponseEntity.ok(Map.of("message", "All complaints cleared successfully"));
    }

    @RequestMapping(value = "/{id}/ai-category", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<?> reviewAiCategory(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Rule A.3: ai-category: only the councillor of complaint.ward, or ADMIN.
        accessGuard.checkCouncillorCanManageComplaint(principal, complaint, "review AI category of");
        
        String category = body != null ? body.get("category") : null;
        if (category == null || category.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category is required"));
        }
        
        Complaint updated = complaintService.reviewAiCategory(id, category, principal.getId(), principal.getFullName());
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/link-duplicate", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<?> linkDuplicate(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Rule A.3: link-duplicate: only the councillor of complaint.ward, or ADMIN.
        accessGuard.checkCouncillorCanManageComplaint(principal, complaint, "link duplicates for");
        
        boolean isDuplicate = false;
        String masterId = null;
        if (body != null) {
            Object dupObj = body.get("isDuplicate");
            if (dupObj instanceof Boolean) {
                isDuplicate = (Boolean) dupObj;
            } else if (dupObj != null) {
                isDuplicate = Boolean.parseBoolean(String.valueOf(dupObj));
            }
            Object mObj = body.get("masterId");
            if (mObj != null) {
                masterId = String.valueOf(mObj);
            }
        }
        
        if (isDuplicate && (masterId == null || masterId.trim().isEmpty())) {
            return ResponseEntity.badRequest().body(Map.of("error", "masterId is required if isDuplicate is true"));
        }
        
        Complaint updated = complaintService.linkDuplicate(id, masterId, isDuplicate, principal.getId(), principal.getFullName());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/predict-category")
    public ResponseEntity<?> predictCategory(@RequestBody(required = false) Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String text = "";
        if (body != null) {
            if (body.containsKey("complaint_text")) {
                text = body.get("complaint_text");
            } else if (body.containsKey("text")) {
                text = body.get("text");
            } else {
                String title = body.getOrDefault("title", "");
                String desc = body.getOrDefault("description", "");
                text = (title + ". " + desc).trim();
            }
        }
        Map<String, Object> prediction = complaintService.predictCategory(text);
        return ResponseEntity.ok(prediction);
    }

    @GetMapping("/predict-category")
    public ResponseEntity<?> predictCategoryGet(@RequestParam(name = "text", required = false) String text) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Map<String, Object> prediction = complaintService.predictCategory(text != null ? text : "");
        return ResponseEntity.ok(prediction);
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<?> submitFeedback(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("message", "Feedback recorded"));
    }

    @GetMapping("/{id}/feedback")
    public ResponseEntity<?> getFeedback(@PathVariable String id) {
        return ResponseEntity.noContent().build();
    }
}
