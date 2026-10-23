package com.sgcs.security;

import com.sgcs.entity.Complaint;
import com.sgcs.entity.Notice;
import com.sgcs.entity.Notification;
import com.sgcs.entity.Proposal;
import com.sgcs.entity.User;
import com.sgcs.exception.BadRequestException;
import com.sgcs.repository.UserRepository;
import com.sgcs.repository.WardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class AccessGuard {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WardRepository wardRepository;

    public boolean isSameWard(String wardA, String wardB) {
        if (wardA == null || wardB == null) return false;
        String a = wardA.trim().toLowerCase();
        String b = wardB.trim().toLowerCase();
        if (a.isEmpty() || b.isEmpty()) return false;
        if (a.equals(b)) return true;

        if (a.contains("ward ") && b.contains("ward ")) {
            String numA = a.substring(a.indexOf("ward ") + 5).split("[\\s\\-]")[0].trim();
            String numB = b.substring(b.indexOf("ward ") + 5).split("[\\s\\-]")[0].trim();
            if (!numA.isEmpty() && numA.equals(numB)) {
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

    // A.2: approve, reject-proof: only the COUNCILLOR whose ward equals complaint.ward, or ADMIN. Otherwise 403.
    public void checkCouncillorCanReviewProof(UserPrincipal principal, Complaint complaint, String action) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        if ("COUNCILLOR".equalsIgnoreCase(principal.getRole()) && isSameWard(principal.getWard(), complaint.getWard())) {
            return;
        }
        throw new AccessDeniedException("Forbidden: Only the ward councillor of " + complaint.getWard() + " or admin can " + action);
    }

    // A.3: assign, ai-category, link-duplicate: only the councillor of complaint.ward, or ADMIN.
    public void checkCouncillorCanManageComplaint(UserPrincipal principal, Complaint complaint, String action) {
        if (principal == null) throw new AccessDeniedException("Forbidden - Insufficient permissions");
        if (isAdmin(principal)) return;

        if ("COUNCILLOR".equalsIgnoreCase(principal.getRole()) && isSameWard(principal.getWard(), complaint.getWard())) {
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
            if (principal.getId().equals(complaint.getCitizenId())) {
                return;
            }
            throw new AccessDeniedException("Forbidden: Citizen may read only their own complaint");
        } else if ("WORKER".equals(role)) {
            if (principal.getId().equals(complaint.getAssignedWorkerId())) {
                return;
            }
            throw new AccessDeniedException("Forbidden: Worker may read only complaints assigned to them");
        } else if ("COUNCILLOR".equals(role)) {
            if (isSameWard(principal.getWard(), complaint.getWard())) {
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
            if (principal.getId().equals(complaint.getCitizenId())) {
                return;
            }
            throw new AccessDeniedException("Forbidden: Citizen may comment only on their own complaints");
        } else if ("WORKER".equals(role)) {
            if (principal.getId().equals(complaint.getAssignedWorkerId())) {
                return;
            }
            throw new AccessDeniedException("Forbidden: Worker may comment only on complaints assigned to them");
        } else if ("COUNCILLOR".equals(role)) {
            if (isSameWard(principal.getWard(), complaint.getWard())) {
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
        boolean exists = wardRepository.findAll().stream().anyMatch(w ->
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

    public void checkCitizenCanSubmitFeedback(UserPrincipal principal, Complaint complaint) {
        if (principal == null || !"CITIZEN".equalsIgnoreCase(principal.getRole())) {
            throw new AccessDeniedException("Forbidden: Only citizens can submit feedback");
        }
        if (!principal.getId().equals(complaint.getCitizenId())) {
            throw new AccessDeniedException("Forbidden: Only the citizen who submitted the complaint can provide feedback");
        }
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
