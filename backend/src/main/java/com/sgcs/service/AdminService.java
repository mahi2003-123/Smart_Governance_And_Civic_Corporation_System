package com.sgcs.service;

import com.sgcs.entity.User;
import com.sgcs.entity.Ward;
import com.sgcs.repository.ComplaintRepository;
import com.sgcs.repository.NoticeRepository;
import com.sgcs.repository.ProposalRepository;
import com.sgcs.repository.UserRepository;
import com.sgcs.repository.WardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WardRepository wardRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        String email = user.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new RuntimeException("User email already exists in database.");
        }

        // Enforce 1 Councillor per ward constraint
        if ("COUNCILLOR".equalsIgnoreCase(user.getRole()) && user.getWard() != null && !user.getWard().equals("All Wards")) {
            Optional<User> existingC = userRepository.findByRoleAndWardIgnoreCase("COUNCILLOR", user.getWard());
            if (existingC.isPresent()) {
                User c = existingC.get();
                throw new RuntimeException("Ward \"" + user.getWard() + "\" already has an assigned Councillor (" + c.getFullName() + " - " + c.getEmail() + "). Only 1 Councillor is permitted per ward.");
            }
        }

        user.setId("usr_" + System.currentTimeMillis());
        user.setEmail(email);
        user.setCreatedAt(LocalDateTime.now());
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPassword("password123");
        }

        User saved = userRepository.save(user);

        // Update councillor in Ward entity if role is COUNCILLOR
        if ("COUNCILLOR".equalsIgnoreCase(saved.getRole()) && saved.getWard() != null) {
            Optional<Ward> wardOpt = wardRepository.findByNameIgnoreCase(saved.getWard());
            if (wardOpt.isPresent()) {
                Ward w = wardOpt.get();
                w.setCouncillorName(saved.getFullName());
                w.setCouncillorEmail(saved.getEmail());
                wardRepository.save(w);
            }
        }

        return saved;
    }

    public List<Ward> getAllWards() {
        return wardRepository.findAll();
    }

    public Ward createWard(Ward ward) {
        if (ward.getId() == null || ward.getId().isEmpty()) {
            ward.setId("w_" + System.currentTimeMillis());
        }
        return wardRepository.save(ward);
    }

    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        long totalComplaints = complaintRepository.count();
        long pending = complaintRepository.countByStatus("PENDING");
        long inProgress = complaintRepository.countByStatus("IN_PROGRESS");
        long resolved = complaintRepository.countByStatus("RESOLVED");
        long totalProposals = proposalRepository.count();
        long activeNotices = noticeRepository.count();

        analytics.put("totalComplaints", totalComplaints);
        analytics.put("pendingComplaints", pending);
        analytics.put("inProgressComplaints", inProgress);
        analytics.put("resolvedComplaints", resolved);
        analytics.put("totalProposals", totalProposals);
        analytics.put("activeNotices", activeNotices);

        return analytics;
    }
}
