package com.sgcs.controller;

import com.sgcs.dto.CreateProposalRequest;
import com.sgcs.entity.Proposal;
import com.sgcs.exception.BadRequestException;
import com.sgcs.exception.ResourceNotFoundException;
import com.sgcs.repository.ProposalRepository;
import com.sgcs.security.AccessGuard;
import com.sgcs.security.UserPrincipal;
import com.sgcs.service.ProposalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/proposals")
public class ProposalController {

    @Autowired
    private ProposalService proposalService;

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private AccessGuard accessGuard;

    private UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Proposal>> getAllProposals(@RequestParam(required = false) String ward) {
        if (ward != null && !ward.isEmpty()) {
            return ResponseEntity.ok(proposalService.getProposalsByWard(ward));
        }
        return ResponseEntity.ok(proposalService.getAllProposals());
    }

    @PostMapping
    public ResponseEntity<Proposal> createProposal(@Valid @RequestBody CreateProposalRequest request) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Rule B: Only CITIZEN and COUNCILLOR may create proposals
        accessGuard.checkCanCreateProposal(principal);
        accessGuard.validateWardExists(request.getWard());

        Proposal proposal = new Proposal();
        proposal.setId("prop_" + UUID.randomUUID().toString());
        proposal.setTitle(request.getTitle().trim());
        proposal.setCategory(request.getCategory().trim());
        proposal.setDescription(request.getDescription().trim());
        proposal.setWard(request.getWard().trim());
        proposal.setAuthorName(principal.getFullName());
        proposal.setAuthorRole(principal.getRole());
        proposal.setUpvotes(0);
        proposal.setDownvotes(0);
        proposal.setStatus("ACTIVE");
        proposal.setCreatedAt(LocalDateTime.now());

        Proposal created = proposalService.createProposal(proposal);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<Proposal> voteProposal(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String voteType = (body != null && body.containsKey("voteType")) ? body.get("voteType") : "UP";
        Proposal updated = proposalService.voteProposal(id, principal.getId(), voteType);
        return ResponseEntity.ok(updated);
    }

    @PostMapping({"/{id}/comment", "/{id}/comments"})
    public ResponseEntity<Proposal> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String content = body != null ? body.get("content") : null;
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Comment content cannot be empty");
        }

        // Rule B: ignore author fields from the body. Use principal's values.
        String authorName = principal.getFullName();
        String authorRole = principal.getRole();

        Proposal updated = proposalService.addComment(id, authorName, authorRole, content.trim());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping({"/{id}/review", "/{id}/status"})
    public ResponseEntity<Proposal> reviewProposal(@PathVariable String id, @RequestBody Map<String, String> body) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found: " + id));

        // Rule B: PATCH /{id}/review and /status only for the councillor of proposal.ward, or ADMIN.
        accessGuard.checkCanReviewProposal(principal, proposal);

        String status = body != null ? body.get("status") : null;
        String notes = body != null ? body.get("notes") : null;
        if (notes == null && body != null) {
            notes = body.get("councillorNotes");
        }

        // Rule B: Record the real actor in the audit log instead of "councillor"
        Proposal updated = proposalService.updateStatus(id, status, notes, principal.getId(), principal.getFullName(), principal.getRole());
        return ResponseEntity.ok(updated);
    }
}
