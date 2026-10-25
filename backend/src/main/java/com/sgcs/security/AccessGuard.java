package com.sgcs.security;

import com.sgcs.entity.Complaint;
import com.sgcs.entity.Notice;
import com.sgcs.entity.Notification;
import com.sgcs.entity.Proposal;
import com.sgcs.entity.User;
import com.sgcs.entity.Ward;
import com.sgcs.exception.BadRequestException;
import com.sgcs.repository.UserRepository;
import com.sgcs.repository.WardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class AccessGuard {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WardRepository wardRepository;

    public String extractWardNumber(String str) {
        if (str == null) return null;
        Pattern p = Pattern.compile("(?:ward\\s*|w|^)(\\d+)");
        Matcher m = p.matcher(str.toLowerCase());
        if (m.find()) return m.group(1);
        Matcher m2 = Pattern.compile("\\d+").matcher(str);
        if (m2.find()) return m2.group();
        return null;
    }

    public String cleanWardName(String str) {
        if (str == null) return "";
        return str.replaceAll("(?i)ward\\s*\\d*\\s*[-:]*", "")
                  .replaceAll("[^a-zA-Z0-9]", "")
                  .toLowerCase()
                  .trim();
    }

    public Optional<Ward> findMatchingWard(String rawWard) {
        if (rawWard == null || rawWard.trim().isEmpty() || wardRepository == null) {
            return Optional.empty();
        }
        String target = rawWard.trim();
        List<Ward> all = wardRepository.findAll();

        // 1. Exact or ID match
        for (Ward w : all) {
            if (target.equalsIgnoreCase(w.getName()) || (w.getId() != null && target.equalsIgnoreCase(w.getId()))) {
                return Optional.of(w);
            }
        }

        // 2. Extracted number match
        String num = extractWardNumber(target);
        if (num != null) {
            for (Ward w : all) {
                if (w.getWardNumber() != null && num.equals(String.valueOf(w.getWardNumber()))) {
                    return Optional.of(w);
                }
            }
        }

        // 3. Clean string match
        String cleanTarget = cleanWardName(target);
        if (!cleanTarget.isEmpty()) {
            for (Ward w : all) {
                String cleanW = cleanWardName(w.getName());
                if (!cleanW.isEmpty() && (cleanW.equals(cleanTarget) || cleanW.contains(cleanTarget) || cleanTarget.contains(cleanW))) {
                    return Optional.of(w);
                }
            }
        }

        // 4. Standard aliases check
        Map<String, List<String>> aliases = Map.of(
            "1", List.of("central", "central town"),
            "2", List.of("south", "riverside", "riverside north"),
            "3", List.of("east", "east hill", "east hill view", "hill view"),
            "4", List.of("green valley", "green valley south", "valley south")
        );
        for (Map.Entry<String, List<String>> entry : aliases.entrySet()) {
            String wardNum = entry.getKey();
            List<String> keywords = entry.getValue();
            boolean matchesTarget = (num != null && num.equals(wardNum)) || keywords.stream().anyMatch(target.toLowerCase()::contains);
            if (matchesTarget) {
                for (Ward w : all) {
                    if (w.getWardNumber() != null && wardNum.equals(String.valueOf(w.getWardNumber()))) {
                        return Optional.of(w);
                    }
                }
            }
        }

        return Optional.empty();
    }

    public boolean isSameWard(String wardA, String wardB) {
        if (wardA == null || wardB == null) return false;
        String a = wardA.trim().toLowerCase();
        String b = wardB.trim().toLowerCase();
        if (a.isEmpty() || b.isEmpty()) return false;
        if (a.equals(b)) return true;

        String numA = extractWardNumber(a);
        String numB = extractWardNumber(b);

        if (numA != null && numB != null) {
            return numA.equals(numB);
        }

        // Check if both resolve to the same ward in the repository
        if (wardRepository != null) {
            Optional<Ward> matchA = findMatchingWard(a);
            Optional<Ward> matchB = findMatchingWard(b);
            if (matchA.isPresent() && matchB.isPresent() && matchA.get().getId().equals(matchB.get().getId())) {
                return true;
            }
        }

        // Clean names
        String cleanA = cleanWardName(a);
        String cleanB = cleanWardName(b);
        if (!cleanA.isEmpty() && !cleanB.isEmpty()) {
            if (cleanA.equals(cleanB) || cleanA.contains(cleanB) || cleanB.contains(cleanA)) {
                return true;
            }
        }

        // SGCS default ward aliases check
        Map<String, List<String>> aliases = Map.of(
            "1", List.of("central", "central town"),
            "2", List.of("south", "riverside", "riverside north"),
            "3", List.of("east", "east hill", "east hill view", "hill view"),
            "4", List.of("green valley", "green valley south", "valley south")
        );

        for (Map.Entry<String, List<String>> entry : aliases.entrySet()) {
            String wardNum = entry.getKey();
            List<String> keywords = entry.getValue();

            boolean aMatches = (numA != null && numA.equals(wardNum)) || keywords.stream().anyMatch(a::contains);
            boolean bMatches = (numB != null && numB.equals(wardNum)) || keywords.stream().anyMatch(b::contains);

            if (aMatches && bMatches) {
                return true;
            }
        }

        return a.contains(b) || b.contains(a);
    }

    public boolean isAdmin(UserPrincipal principal) {
        return principal != null && "ADMIN".equalsIgnoreCase(principal.getRole());
    }

    // A.1: start, complete, delay: only the assigned worker (principal.id == complaint.assignedWorkerId) or ADMIN. Otherwise 403.
    public void checkWorkerCanModifyTask(UserPrincipal principal, Complaint complaint, String action) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        if ("WORKER".equalsIgnoreCase(principal.getRole()) && principal.getId().equals(complaint.getAssignedWorkerId())) {
            return;
        }
        throw new AccessDeniedException("Forbidden: Only the assigned worker or admin can " + action + " this task");
    }

    public boolean isCouncillorForWard(UserPrincipal principal, String targetWard) {
        if (principal == null) return false;
        if (isAdmin(principal)) return true;
        if (!"COUNCILLOR".equalsIgnoreCase(principal.getRole())) return false;

        if (isSameWard(principal.getWard(), targetWard)) {
            return true;
        }

        if (targetWard != null && !targetWard.trim().isEmpty() && wardRepository != null) {
            return wardRepository.findAll().stream().anyMatch(w ->
                isSameWard(w.getName(), targetWard) && (
                    (w.getCouncillorEmail() != null && principal.getEmail() != null && w.getCouncillorEmail().equalsIgnoreCase(principal.getEmail())) ||
                    (w.getCouncillorName() != null && principal.getFullName() != null && w.getCouncillorName().equalsIgnoreCase(principal.getFullName())) ||
                    (w.getId() != null && principal.getWard() != null && (w.getId().equalsIgnoreCase(principal.getWard()) || isSameWard(w.getId(), principal.getWard())))
                )
            );
        }
        return false;
    }

    // A.2: approve, reject-proof: only the COUNCILLOR whose ward equals complaint.ward, or ADMIN. Otherwise 403.
    public void checkCouncillorCanReviewProof(UserPrincipal principal, Complaint complaint, String action) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        if (isCouncillorForWard(principal, complaint.getWard())) {
            return;
        }
        throw new AccessDeniedException("Forbidden: Only the ward councillor of " + complaint.getWard() + " or admin can " + action);
    }

    // A.3: assign, ai-category, link-duplicate: only the councillor of complaint.ward, or ADMIN.
    public void checkCouncillorCanManageComplaint(UserPrincipal principal, Complaint complaint, String action) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        if (isCouncillorForWard(principal, complaint.getWard())) {
            return;
        }
        throw new AccessDeniedException("Forbidden: Only the ward councillor of " + complaint.getWard() + " or admin can " + action);
    }

    // A.3: check target workerId belongs to a user with role WORKER and is ACTIVE.
    public User validateActiveWorker(String workerId) {
        if (workerId == null || workerId.trim().isEmpty()) {
            throw new BadRequestException("Worker ID is required");
        }
        User worker = userRepository.findById(workerId.trim())
                .orElseThrow(() -> new BadRequestException("Target worker not found with id: " + workerId));

        if (!"WORKER".equalsIgnoreCase(worker.getRole())) {
            throw new BadRequestException("User " + workerId + " is not a worker (role: " + worker.getRole() + ")");
        }
        if (worker.getStatus() != null && !"ACTIVE".equalsIgnoreCase(worker.getStatus())) {
            throw new BadRequestException("Worker " + workerId + " is not ACTIVE (current status: " + worker.getStatus() + ")");
        }
        return worker;
    }

    // A.4: GET /{id}: CITIZEN may read only their own complaint. WORKER only if assigned. COUNCILLOR only for their ward. ADMIN any.
    public void checkCanReadComplaint(UserPrincipal principal, Complaint complaint) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        String role = principal.getRole() != null ? principal.getRole().toUpperCase() : "";
        if ("CITIZEN".equals(role)) {
            boolean matchesId = principal.getId() != null && principal.getId().equals(complaint.getCitizenId());
            boolean matchesEmail = principal.getEmail() != null && complaint.getCitizenId() != null && principal.getEmail().equalsIgnoreCase(complaint.getCitizenId());
            boolean matchesName = principal.getFullName() != null && complaint.getCitizenName() != null && principal.getFullName().equalsIgnoreCase(complaint.getCitizenName());
            boolean matchesPhone = principal.getPhone() != null && !principal.getPhone().trim().isEmpty() && complaint.getCitizenPhone() != null && principal.getPhone().trim().equals(complaint.getCitizenPhone().trim());
            if (matchesId || matchesEmail || matchesName || matchesPhone) {
                return;
            }
            throw new AccessDeniedException("Forbidden: Citizen may read only their own complaint");
        } else if ("WORKER".equals(role)) {
            boolean matchesId = principal.getId() != null && principal.getId().equals(complaint.getAssignedWorkerId());
            boolean matchesEmail = principal.getEmail() != null && complaint.getAssignedWorkerId() != null && principal.getEmail().equalsIgnoreCase(complaint.getAssignedWorkerId());
            boolean matchesName = principal.getFullName() != null && complaint.getAssignedWorkerName() != null && principal.getFullName().equalsIgnoreCase(complaint.getAssignedWorkerName());
            if (matchesId || matchesEmail || matchesName) {
                return;
            }
            throw new AccessDeniedException("Forbidden: Worker may read only complaints assigned to them");
        } else if ("COUNCILLOR".equals(role)) {
            if (isCouncillorForWard(principal, complaint.getWard())) {
                return;
            }
            throw new AccessDeniedException("Forbidden: Councillor may read only complaints in their assigned ward");
        }
        throw new AccessDeniedException("Forbidden: Insufficient permissions to view complaint");
    }

    // A.5: GET list: COUNCILLOR with an empty ward must get 403, not all complaints. A COUNCILLOR passing another ward gets 403. A CITIZEN may not pass another citizen's id.
    public void checkCanListComplaints(UserPrincipal principal, String citizenId, String ward) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        String role = principal.getRole() != null ? principal.getRole().toUpperCase() : "";
        if ("COUNCILLOR".equals(role)) {
            if (principal.getWard() == null || principal.getWard().trim().isEmpty()) {
                throw new AccessDeniedException("Forbidden: Councillor has no assigned ward");
            }
            if (ward != null && !ward.trim().isEmpty() && !isSameWard(principal.getWard(), ward)) {
                throw new AccessDeniedException("Forbidden: Councillor cannot access complaints from another ward");
            }
        } else if ("CITIZEN".equals(role)) {
            if (citizenId != null && !citizenId.trim().isEmpty() && !principal.getId().equals(citizenId.trim())) {
                throw new AccessDeniedException("Forbidden: Citizen may not view complaints belonging to another citizen");
            }
        }
    }

    // A.6: Comments: CITIZEN may comment only on own complaints, WORKER on assigned ones, COUNCILLOR on own ward.
    public void checkCanCommentComplaint(UserPrincipal principal, Complaint complaint) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        String role = principal.getRole() != null ? principal.getRole().toUpperCase() : "";
        if ("CITIZEN".equals(role)) {
            boolean matchesId = principal.getId() != null && principal.getId().equals(complaint.getCitizenId());
            boolean matchesEmail = principal.getEmail() != null && complaint.getCitizenId() != null && principal.getEmail().equalsIgnoreCase(complaint.getCitizenId());
            boolean matchesName = principal.getFullName() != null && complaint.getCitizenName() != null && principal.getFullName().equalsIgnoreCase(complaint.getCitizenName());
            boolean matchesPhone = principal.getPhone() != null && !principal.getPhone().trim().isEmpty() && complaint.getCitizenPhone() != null && principal.getPhone().trim().equals(complaint.getCitizenPhone().trim());
            if (matchesId || matchesEmail || matchesName || matchesPhone) {
                return;
            }
            throw new AccessDeniedException("Forbidden: Citizen may comment only on their own complaints");
        } else if ("WORKER".equals(role)) {
            boolean matchesId = principal.getId() != null && principal.getId().equals(complaint.getAssignedWorkerId());
            boolean matchesEmail = principal.getEmail() != null && complaint.getAssignedWorkerId() != null && principal.getEmail().equalsIgnoreCase(complaint.getAssignedWorkerId());
            boolean matchesName = principal.getFullName() != null && complaint.getAssignedWorkerName() != null && principal.getFullName().equalsIgnoreCase(complaint.getAssignedWorkerName());
            if (matchesId || matchesEmail || matchesName) {
                return;
            }
            throw new AccessDeniedException("Forbidden: Worker may comment only on complaints assigned to them");
        } else if ("COUNCILLOR".equals(role)) {
            if (isCouncillorForWard(principal, complaint.getWard())) {
                return;
            }
            throw new AccessDeniedException("Forbidden: Councillor may comment only on complaints in their assigned ward");
        }
        throw new AccessDeniedException("Forbidden: Insufficient permissions to comment on complaint");
    }

    // A.7: Validate ward exists.
    public void validateWardExists(String ward) {
        if (ward == null || ward.trim().isEmpty()) {
            throw new BadRequestException("Ward is required");
        }
        String target = ward.trim();
        boolean exists = findMatchingWard(target).isPresent() || wardRepository.findAll().stream().anyMatch(w ->
            isSameWard(w.getName(), target) ||
            (w.getId() != null && w.getId().equalsIgnoreCase(target)) ||
            (w.getWardNumber() != null && (
                target.equalsIgnoreCase("Ward " + w.getWardNumber()) ||
                target.equalsIgnoreCase(String.valueOf(w.getWardNumber())) ||
                isSameWard("Ward " + w.getWardNumber(), target)
            ))
        );
        if (!exists) {
            throw new BadRequestException("Ward '" + ward + "' does not exist in the municipal registry");
        }
    }

    // B: Proposal review / status: only for councillor of proposal.ward or ADMIN
    public void checkCanReviewProposal(UserPrincipal principal, Proposal proposal) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        if ("COUNCILLOR".equalsIgnoreCase(principal.getRole()) && isSameWard(principal.getWard(), proposal.getWard())) {
            return;
        }
        throw new AccessDeniedException("Forbidden: Only the ward councillor of " + proposal.getWard() + " or admin can review this proposal");
    }

    // B: Only CITIZEN and COUNCILLOR may create proposals
    public void checkCanCreateProposal(UserPrincipal principal) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        String role = principal.getRole() != null ? principal.getRole().toUpperCase() : "";
        if ("CITIZEN".equals(role) || "COUNCILLOR".equals(role) || "ADMIN".equals(role)) {
            return;
        }
        throw new AccessDeniedException("Forbidden: Only citizens and councillors may create proposals");
    }

    // C: markAsRead only if the notification belongs to caller (recipient id equals user id, or ward_<theirWard>, or ALL).
    public void checkCanMarkNotificationRead(UserPrincipal principal, Notification notification) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        String recipient = notification.getRecipientId();
        if (recipient == null || "ALL".equalsIgnoreCase(recipient.trim())) return;
        if (principal.getId().equals(recipient.trim())) return;
        if (principal.getRole() != null && principal.getRole().equalsIgnoreCase(recipient.trim())) return;

        if (recipient.toLowerCase().startsWith("ward_")) {
            String notifWard = recipient.substring(5).trim();
            if (isSameWard(principal.getWard(), notifWard)) {
                return;
            }
        }
        throw new AccessDeniedException("Forbidden: Cannot mark notification belonging to another recipient as read");
    }

    // D: only COUNCILLOR (their own ward or "system wide" ONLY if ADMIN) and ADMIN may create or delete
    public void checkCanCreateNotice(UserPrincipal principal, String targetWard) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        if ("COUNCILLOR".equalsIgnoreCase(principal.getRole())) {
            if (targetWard == null || targetWard.trim().isEmpty() ||
                targetWard.toLowerCase().contains("system wide") ||
                targetWard.toLowerCase().contains("all wards") ||
                "ALL".equalsIgnoreCase(targetWard.trim())) {
                throw new AccessDeniedException("Forbidden: Councillors cannot publish system-wide notices. Only admin may publish system-wide notices.");
            }
            if (isSameWard(principal.getWard(), targetWard)) {
                return;
            }
            throw new AccessDeniedException("Forbidden: Councillor can only publish notices for their assigned ward (" + principal.getWard() + ")");
        }

        throw new AccessDeniedException("Forbidden: Only councillors and admins may publish notices");
    }

    public void checkCanDeleteNotice(UserPrincipal principal, Notice notice) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        if ("COUNCILLOR".equalsIgnoreCase(principal.getRole()) && isSameWard(principal.getWard(), notice.getWard())) {
            return;
        }
        throw new AccessDeniedException("Forbidden: Only ward councillor or admin can delete this notice");
    }
}
