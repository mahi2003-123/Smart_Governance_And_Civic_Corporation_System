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
        proposal.setCreatedAt(LocalDateTime.now());
        return proposalRepository.save(proposal);
    }

    public Proposal voteProposal(String id, String type) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found: " + id));

        if ("UP".equalsIgnoreCase(type)) {
            proposal.setUpvotes(proposal.getUpvotes() + 1);
        } else if ("DOWN".equalsIgnoreCase(type)) {
            proposal.setDownvotes(proposal.getDownvotes() + 1);
        }

        return proposalRepository.save(proposal);
    }

    public Proposal updateStatus(String id, String status, String notes) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found: " + id));

        proposal.setStatus(status);
        if (notes != null) {
            proposal.setCouncillorNotes(notes);
        }

        return proposalRepository.save(proposal);
    }
}
