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

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> voteProposal(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String voteType = body.getOrDefault("voteType", "UP");
            Proposal updated = proposalService.voteProposal(id, voteType);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<?> reviewProposal(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            String notes = body.get("notes");
            Proposal updated = proposalService.updateStatus(id, status, notes);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
