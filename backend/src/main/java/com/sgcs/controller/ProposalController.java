package com.sgcs.controller;

import com.sgcs.entity.Proposal;
import com.sgcs.service.ProposalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proposals")
public class ProposalController {

    @Autowired
    private ProposalService proposalService;

    @GetMapping
    public ResponseEntity<List<Proposal>> getAllProposals(@RequestParam(required = false) String ward) {
        if (ward != null && !ward.isEmpty()) {
            return ResponseEntity.ok(proposalService.getProposalsByWard(ward));
        }
        return ResponseEntity.ok(proposalService.getAllProposals());
    }

    @PostMapping
    public ResponseEntity<?> createProposal(@RequestBody Proposal proposal) {
        try {
            Proposal created = proposalService.createProposal(proposal);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    private com.sgcs.security.UserPrincipal getCurrentUser() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.sgcs.security.UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> voteProposal(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            com.sgcs.security.UserPrincipal principal = getCurrentUser();
            String userId = principal != null ? principal.getId() : body.get("userId");
            String voteType = body.getOrDefault("voteType", "UP");
            Proposal updated = proposalService.voteProposal(id, userId, voteType);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping({"/{id}/comment", "/{id}/comments"})
    public ResponseEntity<?> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String content = body.get("content");
            String authorName = body.getOrDefault("authorName", "Citizen Resident");
            String authorRole = body.getOrDefault("authorRole", "CITIZEN");

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Comment content cannot be empty"));
            }

            Proposal updated = proposalService.addComment(id, authorName, authorRole, content.trim());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping({"/{id}/review", "/{id}/status"})
    public ResponseEntity<?> reviewProposal(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            String notes = body.get("notes");
            if (notes == null) {
                notes = body.get("councillorNotes");
            }
            Proposal updated = proposalService.updateStatus(id, status, notes);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
