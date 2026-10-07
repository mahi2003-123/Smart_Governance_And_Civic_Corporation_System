package com.sgcs.controller;

import com.sgcs.entity.Proposal;
import com.sgcs.exception.BadRequestException;
import com.sgcs.security.UserPrincipal;
import com.sgcs.service.ProposalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proposals")
public class ProposalController {

    @Autowired
    private ProposalService proposalService;

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
    public ResponseEntity<Proposal> createProposal(@Valid @RequestBody Proposal proposal) {
        UserPrincipal principal = getCurrentUser();
        if (principal != null) {
            proposal.setAuthorName(principal.getFullName());
            proposal.setAuthorRole(principal.getRole());
        }
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
        String content = body != null ? body.get("content") : null;
        String authorName = (principal != null) ? principal.getFullName() : (body != null ? body.getOrDefault("authorName", "Resident") : "Resident");
        String authorRole = (principal != null) ? principal.getRole() : (body != null ? body.getOrDefault("authorRole", "CITIZEN") : "CITIZEN");

        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Comment content cannot be empty");
        }

        Proposal updated = proposalService.addComment(id, authorName, authorRole, content.trim());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping({"/{id}/review", "/{id}/status"})
    public ResponseEntity<Proposal> reviewProposal(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body != null ? body.get("status") : null;
        String notes = body != null ? body.get("notes") : null;
        if (notes == null && body != null) {
            notes = body.get("councillorNotes");
        }
        Proposal updated = proposalService.updateStatus(id, status, notes);
        return ResponseEntity.ok(updated);
    }
}
