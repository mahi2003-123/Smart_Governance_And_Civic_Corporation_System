package com.sgcs.service;

import com.sgcs.entity.Proposal;
import com.sgcs.repository.ProposalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProposalService {

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private AuditService auditService;

    public List<Proposal> getAllProposals() {
        return proposalRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Proposal> getProposalsByWard(String ward) {
        return proposalRepository.findByWardOrderByCreatedAtDesc(ward);
    }

    public Proposal createProposal(Proposal proposal) {
        if (proposal.getId() == null || proposal.getId().isEmpty()) {
            proposal.setId("prop_" + System.currentTimeMillis());
        }
        if (proposal.getUpvotes() == null) proposal.setUpvotes(0);
        if (proposal.getDownvotes() == null) proposal.setDownvotes(0);
        if (proposal.getAuthorRole() == null || proposal.getAuthorRole().isEmpty()) {
            proposal.setAuthorRole("CITIZEN");
        }
        proposal.setCreatedAt(LocalDateTime.now());
        Proposal saved = proposalRepository.save(proposal);

        auditService.logActivity(
            saved.getAuthorName() != null ? saved.getAuthorName() : "user",
            saved.getAuthorName() != null ? saved.getAuthorName() : "Resident",
            saved.getAuthorRole(),
            "Submitted Proposal",
            "PROPOSAL",
            saved.getId(),
            "Created civic proposal: \"" + saved.getTitle() + "\" in " + saved.getWard()
        );

        return saved;
    }

    @Autowired
    private NotificationService notificationService;

    public Proposal voteProposal(String id, String userId, String type) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found: " + id));

        String voterKey = (userId != null && !userId.isEmpty()) ? userId : "user_anon";
        String previousVote = proposal.getUserVotes().get(voterKey);

        int up = proposal.getUpvotes() == null ? 0 : proposal.getUpvotes();
        int down = proposal.getDownvotes() == null ? 0 : proposal.getDownvotes();

        if (previousVote != null) {
            if ("UP".equalsIgnoreCase(previousVote)) up = Math.max(0, up - 1);
            if ("DOWN".equalsIgnoreCase(previousVote)) down = Math.max(0, down - 1);
        }

        if ("UP".equalsIgnoreCase(type)) {
            if (!"UP".equalsIgnoreCase(previousVote)) {
                up++;
                proposal.getUserVotes().put(voterKey, "UP");
            } else {
                proposal.getUserVotes().remove(voterKey);
            }
        } else if ("DOWN".equalsIgnoreCase(type)) {
            if (!"DOWN".equalsIgnoreCase(previousVote)) {
                down++;
                proposal.getUserVotes().put(voterKey, "DOWN");
            } else {
                proposal.getUserVotes().remove(voterKey);
            }
        }

        proposal.setUpvotes(up);
        proposal.setDownvotes(down);
        Proposal saved = proposalRepository.save(proposal);

        auditService.logActivity(
            voterKey,
            "Resident",
            "CITIZEN",
            "Voted on Proposal",
            "PROPOSAL",
            saved.getId(),
            "Voted (" + type + ") on civic proposal \"" + saved.getTitle() + "\""
        );

        return saved;
    }

    public Proposal addComment(String id, String authorName, String authorRole, String content) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found: " + id));

        Proposal.ProposalComment comment = new Proposal.ProposalComment(authorName, authorRole, content);
        proposal.getComments().add(comment);

        return proposalRepository.save(proposal);
    }

    public Proposal updateStatus(String id, String status, String notes) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found: " + id));

        proposal.setStatus(status);
        if (notes != null) {
            proposal.setCouncillorNotes(notes);
        }

        Proposal saved = proposalRepository.save(proposal);

        auditService.logActivity(
            "councillor",
            "Ward Councillor",
            "COUNCILLOR",
            "Updated Proposal Status",
            "PROPOSAL",
            saved.getId(),
            "Updated proposal status to " + status + " for \"" + saved.getTitle() + "\""
        );

        return saved;
    }
}
