package com.sgcs.service;

import com.sgcs.dto.CreateUserRequest;
import com.sgcs.entity.Complaint;
import com.sgcs.entity.User;
import com.sgcs.entity.Ward;
import com.sgcs.exception.BadRequestException;
import com.sgcs.exception.ResourceNotFoundException;
import com.sgcs.repository.ComplaintRepository;
import com.sgcs.repository.NoticeRepository;
import com.sgcs.repository.ProposalRepository;
import com.sgcs.repository.UserRepository;
import com.sgcs.repository.WardRepository;
import com.sgcs.security.AccessGuard;
import com.sgcs.security.PasswordPolicy;
import com.sgcs.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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

    @Autowired
    private AuditService auditService;

    @Autowired
    private AccessGuard accessGuard;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(CreateUserRequest request) {
        return createUser(request, null);
    }

    public User createUser(CreateUserRequest request, UserPrincipal adminPrincipal) {
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new BadRequestException("Full name is required.");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email is required.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new BadRequestException("Please enter a valid email address (e.g. user@example.com).");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email address \"" + email + "\" is already registered in the system.");
        }

        // Validate role is one of CITIZEN, COUNCILLOR, WORKER (ADMIN creation only via env seed)
        if (request.getRole() == null || (!request.getRole().equalsIgnoreCase("CITIZEN")
                && !request.getRole().equalsIgnoreCase("COUNCILLOR")
                && !request.getRole().equalsIgnoreCase("WORKER"))) {
            throw new BadRequestException("Role must be one of: CITIZEN, COUNCILLOR, WORKER");
        }
        String role = request.getRole().toUpperCase().trim();

        // Validate ward exists
        if (request.getWard() == null || request.getWard().trim().isEmpty()) {
            throw new BadRequestException("Ward is required.");
        }
        accessGuard.validateWardExists(request.getWard().trim());

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String cleanPhone = request.getPhone().replaceAll("[\\s\\-\\+]", "");
            String numberToCheck = (cleanPhone.startsWith("91") && cleanPhone.length() == 12) ? cleanPhone.substring(2) : cleanPhone;
            if (!numberToCheck.matches("^[6-9]\\d{9}$")) {
                throw new BadRequestException("Phone number must be a 10-digit mobile number starting with 6, 7, 8, or 9.");
            }
        }

        // Enforce strict 1 Councillor per ward constraint
        if ("COUNCILLOR".equalsIgnoreCase(role) && !request.getWard().equalsIgnoreCase("All Wards")) {
            String targetWard = request.getWard().trim();
            List<User> allCouncillors = userRepository.findByRoleIgnoreCase("COUNCILLOR");
            
            for (User c : allCouncillors) {
                if (c.getWard() != null && isSameWard(c.getWard(), targetWard)) {
                    throw new BadRequestException("Ward \"" + targetWard + "\" already has an assigned Ward Councillor (" + c.getFullName() + " - " + c.getEmail() + "). Only 1 Councillor is permitted per municipal ward.");
                }
            }
        }

        User user = new User();
        user.setId("usr_" + UUID.randomUUID().toString());
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setRole(role);
        user.setWard(request.getWard().trim());
        user.setSpecialization(request.getSpecialization());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());

        // Password handling: do NOT trim password
        String rawPassword = request.getPassword();
        String temporaryPassword = null;
        if (rawPassword != null && !rawPassword.isEmpty()) {
            PasswordPolicy.validate(rawPassword);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setMustChangePassword(false);
        } else {
            temporaryPassword = PasswordPolicy.generateTemporaryPassword();
            user.setPassword(passwordEncoder.encode(temporaryPassword));
            user.setMustChangePassword(true);
            user.setTemporaryPassword(temporaryPassword);
        }

        User saved = userRepository.save(user);

        // Update councillor in Ward entity if role is COUNCILLOR
        if ("COUNCILLOR".equalsIgnoreCase(saved.getRole()) && saved.getWard() != null) {
            Optional<Ward> wardOpt = accessGuard.findMatchingWard(saved.getWard());
            if (wardOpt.isPresent()) {
                Ward w = wardOpt.get();
                w.setCouncillorName(saved.getFullName());
                w.setCouncillorEmail(saved.getEmail());
                wardRepository.save(w);
            }
        }

        String adminId = adminPrincipal != null ? adminPrincipal.getId() : "admin";
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Super Admin";

        auditService.logActivity(
            adminId,
            adminName,
            "ADMIN",
            "Created User Account",
            "ADMIN",
            saved.getId(),
            "Created " + saved.getRole() + " account for " + saved.getFullName() + " (" + saved.getEmail() + ")" + (saved.getWard() != null ? " assigned to " + saved.getWard() : "")
        );

        if (temporaryPassword != null) {
            saved.setTemporaryPassword(temporaryPassword);
        }

        return saved;
    }

    public User updateUserStatus(String userId, String status) {
        return updateUserStatus(userId, status, null);
    }

    public User updateUserStatus(String userId, String status, UserPrincipal adminPrincipal) {
        if (status == null || (!status.equalsIgnoreCase("ACTIVE") && !status.equalsIgnoreCase("INACTIVE"))) {
            throw new BadRequestException("Invalid status: must be ACTIVE or INACTIVE");
        }
        String targetStatus = status.toUpperCase().trim();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Requirement 9: an admin cannot deactivate their own account or the last active ADMIN
        if (adminPrincipal != null && adminPrincipal.getId().equals(userId) && "INACTIVE".equals(targetStatus)) {
            throw new BadRequestException("You cannot deactivate your own admin account.");
        }

        if ("ADMIN".equalsIgnoreCase(user.getRole()) && "INACTIVE".equals(targetStatus) && "ACTIVE".equalsIgnoreCase(user.getStatus())) {
            long activeAdmins = userRepository.findByRoleIgnoreCase("ADMIN").stream()
                    .filter(u -> "ACTIVE".equalsIgnoreCase(u.getStatus()))
                    .count();
            if (activeAdmins <= 1) {
                throw new BadRequestException("Cannot deactivate the last active administrator account.");
            }
        }

        user.setStatus(targetStatus);
        User saved = userRepository.save(user);

        String adminId = adminPrincipal != null ? adminPrincipal.getId() : "admin";
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Super Admin";

        auditService.logActivity(
            adminId,
            adminName,
            "ADMIN",
            "Updated User Status",
            "ADMIN",
            saved.getId(),
            "Updated account status of " + saved.getFullName() + " to " + targetStatus
        );

        return saved;
    }

    public void deleteUser(String userId) {
        deleteUser(userId, null);
    }

    public void deleteUser(String userId, UserPrincipal adminPrincipal) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Requirement 9: an admin cannot delete their own account or the last active ADMIN
        if (adminPrincipal != null && adminPrincipal.getId().equals(userId)) {
            throw new BadRequestException("You cannot delete your own admin account.");
        }

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            long activeAdmins = userRepository.findByRoleIgnoreCase("ADMIN").stream()
                    .filter(u -> "ACTIVE".equalsIgnoreCase(u.getStatus()))
                    .count();
            if (activeAdmins <= 1) {
                throw new BadRequestException("Cannot delete the last active administrator account.");
            }
        }

        // Clear ward assignment if councillor is deleted
        if ("COUNCILLOR".equalsIgnoreCase(user.getRole())) {
            List<Ward> wards = wardRepository.findAll();
            for (Ward w : wards) {
                if ((w.getCouncillorEmail() != null && w.getCouncillorEmail().equalsIgnoreCase(user.getEmail()))
                        || (user.getWard() != null && accessGuard.isSameWard(w.getName(), user.getWard()))) {
                    w.setCouncillorName("Unassigned");
                    w.setCouncillorEmail("");
                    wardRepository.save(w);
                }
            }
        }

        // Strictly delete ONLY the targeted single user by primary key ID
        userRepository.deleteById(userId);

        String adminId = adminPrincipal != null ? adminPrincipal.getId() : "admin";
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Super Admin";

        auditService.logActivity(
            adminId,
            adminName,
            "ADMIN",
            "Deleted User Account",
            "ADMIN",
            user.getId(),
            "Deleted " + user.getRole() + " user record: " + user.getFullName() + " (" + user.getEmail() + ")"
        );
    }

    public User updateUserWard(String userId, String newWard, UserPrincipal adminPrincipal) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        if (newWard == null || newWard.trim().isEmpty()) {
            throw new BadRequestException("Ward is required");
        }
        accessGuard.validateWardExists(newWard.trim());

        String oldWard = user.getWard();
        user.setWard(newWard.trim());
        User saved = userRepository.save(user);

        // If user is a COUNCILLOR, update Ward assignments
        if ("COUNCILLOR".equalsIgnoreCase(saved.getRole())) {
            // 1. Clear old ward if assigned to this councillor
            if (oldWard != null && !oldWard.trim().isEmpty()) {
                accessGuard.findMatchingWard(oldWard).ifPresent(w -> {
                    if (saved.getEmail().equalsIgnoreCase(w.getCouncillorEmail())) {
                        w.setCouncillorName("Unassigned");
                        w.setCouncillorEmail("");
                        wardRepository.save(w);
                    }
                });
            }
            // 2. Assign new ward
            accessGuard.findMatchingWard(newWard).ifPresent(w -> {
                w.setCouncillorName(saved.getFullName());
                w.setCouncillorEmail(saved.getEmail());
                wardRepository.save(w);
            });
        }

        String adminId = adminPrincipal != null ? adminPrincipal.getId() : "admin";
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Super Admin";

        auditService.logActivity(
            adminId,
            adminName,
            "ADMIN",
            "Updated User Ward",
            "ADMIN",
            saved.getId(),
            "Updated ward of " + saved.getFullName() + " to " + newWard
        );

        return saved;
    }

    public boolean isSameWard(String wardA, String wardB) {
        return accessGuard.isSameWard(wardA, wardB);
    }

    public List<Ward> getAllWards() {
        List<Ward> wards = wardRepository.findAll();
        if (wards.isEmpty()) {
            List<Ward> defaultWards = List.of(
                new Ward("w1", 1, "Ward 1 - Central Town", "Unassigned", "", 45000),
                new Ward("w2", 2, "Ward 2 - Riverside North", "Unassigned", "", 32000),
                new Ward("w3", 3, "Ward 3 - East Hill View", "Unassigned", "", 51000),
                new Ward("w4", 4, "Ward 4 - Green Valley South", "Unassigned", "", 38000),
                new Ward("w5", 5, "Ward 5 - Industrial Hub West", "Unassigned", "", 42000),
                new Ward("w6", 6, "Ward 6 - Tech Park Corridor", "Unassigned", "", 48000),
                new Ward("w7", 7, "Ward 7 - Metro Station Circle", "Unassigned", "", 39000),
                new Ward("w8", 8, "Ward 8 - Heritage Old City", "Unassigned", "", 36000)
            );
            try {
                wards = wardRepository.saveAll(defaultWards);
            } catch (Exception e) {
                wards = defaultWards;
            }
        }
        List<Complaint> complaints = complaintRepository.findAll();
        List<User> councillors = userRepository.findByRoleIgnoreCase("COUNCILLOR");

        for (Ward w : wards) {
            // Find active councillor for this ward
            User matchingCouncillor = null;
            for (User u : councillors) {
                if (u.getWard() != null && ("ACTIVE".equalsIgnoreCase(u.getStatus()) || u.getStatus() == null)) {
                    if (accessGuard.isSameWard(u.getWard(), w.getName())) {
                        matchingCouncillor = u;
                        break;
                    }
                }
            }

            if (matchingCouncillor != null) {
                if (!matchingCouncillor.getFullName().equals(w.getCouncillorName())
                        || !matchingCouncillor.getEmail().equals(w.getCouncillorEmail())) {
                    w.setCouncillorName(matchingCouncillor.getFullName());
                    w.setCouncillorEmail(matchingCouncillor.getEmail());
                    try {
                        wardRepository.save(w);
                    } catch (Exception ignored) {}
                }
            } else if (w.getCouncillorName() == null || w.getCouncillorName().trim().isEmpty()) {
                w.setCouncillorName("Unassigned");
                w.setCouncillorEmail("");
            }

            int active = 0;
            int resolved = 0;
            for (Complaint c : complaints) {
                if (c.getWard() != null && accessGuard.isSameWard(c.getWard(), w.getName())) {
                    if ("RESOLVED".equalsIgnoreCase(c.getStatus())) {
                        resolved++;
                    } else {
                        active++;
                    }
                }
            }
            w.setActiveComplaints(active);
            w.setResolvedComplaints(resolved);
        }
        return wards;
    }

    public Ward createWard(Ward ward) {
        if (ward.getId() == null || ward.getId().isEmpty()) {
            ward.setId("w_" + java.util.UUID.randomUUID().toString());
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

        List<Complaint> allComplaints = complaintRepository.findAll();
        Map<String, Long> categoryMap = allComplaints.stream()
                .filter(c -> c.getCategory() != null && !c.getCategory().trim().isEmpty())
                .collect(Collectors.groupingBy(Complaint::getCategory, Collectors.counting()));
        List<Map<String, Object>> categoryBreakdown = categoryMap.entrySet().stream()
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("category", e.getKey());
                    item.put("count", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());
        analytics.put("categoryBreakdown", categoryBreakdown);

        return analytics;
    }
}
