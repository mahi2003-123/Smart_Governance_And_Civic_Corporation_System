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

import org.springframework.security.crypto.password.PasswordEncoder;

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

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        String email = user.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new RuntimeException("User email already exists in database.");
        }

        // Enforce strict 1 Councillor per ward constraint
        if ("COUNCILLOR".equalsIgnoreCase(user.getRole()) && user.getWard() != null && !user.getWard().equalsIgnoreCase("All Wards")) {
            String targetWard = user.getWard().trim();
            List<User> allCouncillors = userRepository.findByRoleIgnoreCase("COUNCILLOR");
            
            for (User c : allCouncillors) {
                if (c.getWard() != null && isSameWard(c.getWard(), targetWard)) {
                    throw new RuntimeException("Ward \"" + targetWard + "\" already has an assigned Ward Councillor (" + c.getFullName() + " - " + c.getEmail() + "). Only 1 Councillor is permitted per municipal ward.");
                }
            }
        }

        user.setId("usr_" + System.currentTimeMillis());
        user.setEmail(email);
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        
        String rawPassword = (user.getPassword() != null && !user.getPassword().trim().isEmpty()) 
            ? user.getPassword().trim() 
            : "password123";
        user.setPassword(passwordEncoder.encode(rawPassword));

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

    public User updateUserStatus(String userId, String status) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(status);
            return userRepository.save(user);
        } else {
            throw new RuntimeException("User not found with ID: " + userId);
        }
    }

    public void deleteUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Clear ward assignment ONLY if the ward's councillor matches this exact user
            if ("COUNCILLOR".equalsIgnoreCase(user.getRole()) && user.getWard() != null) {
                List<Ward> wards = wardRepository.findAll();
                for (Ward w : wards) {
                    if (w.getCouncillorEmail() != null && w.getCouncillorEmail().equalsIgnoreCase(user.getEmail())) {
                        w.setCouncillorName("Unassigned");
                        w.setCouncillorEmail("");
                        wardRepository.save(w);
                    }
                }
            }

            // Strictly delete ONLY the targeted single user by primary key ID
            userRepository.deleteById(userId);
        } else {
            throw new RuntimeException("User not found with ID: " + userId);
        }
    }

    private boolean isSameWard(String wardA, String wardB) {
        if (wardA == null || wardB == null) return false;
        String a = wardA.trim().toLowerCase();
        String b = wardB.trim().toLowerCase();
        if (a.equals(b)) return true;

        if (a.contains("ward ") && b.contains("ward ")) {
            String numA = a.substring(a.indexOf("ward ") + 5).split(" ")[0].split("-")[0].trim();
            String numB = b.substring(b.indexOf("ward ") + 5).split(" ")[0].split("-")[0].trim();
            if (!numA.isEmpty() && numA.equals(numB)) {
                return true;
            }
        }
        return false;
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
