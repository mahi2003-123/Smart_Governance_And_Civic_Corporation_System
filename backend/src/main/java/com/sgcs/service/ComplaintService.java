package com.sgcs.service;

import com.sgcs.entity.Complaint;
import com.sgcs.entity.Notification;
import com.sgcs.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ComplaintService {

    private static final List<String> VALID_STATUSES = List.of("PENDING", "ASSIGNED", "IN_PROGRESS", "PENDING_APPROVAL", "RESOLVED", "REJECTED");

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Complaint> getComplaintById(String id) {
        return complaintRepository.findByIdOrTrackingNumber(id, id);
    }

    public List<Complaint> getComplaintsByCitizen(String citizenId) {
        return complaintRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
    }

    public List<Complaint> getComplaintsByWard(String ward) {
        return complaintRepository.findByWardOrderByCreatedAtDesc(ward);
    }

    public List<Complaint> getComplaintsForWorker(String workerId, String workerName, String workerEmail, String ward) {
        List<Complaint> all = complaintRepository.findAllByOrderByCreatedAtDesc();
        final String cleanName = workerName != null ? workerName.toLowerCase().replaceAll("\\(.*?\\)", "").trim() : "";
        final String cleanEmail = workerEmail != null ? workerEmail.toLowerCase().trim() : "";
        final String cleanId = workerId != null ? workerId.toLowerCase().trim() : "";

        return all.stream().filter(c -> {
            String assignedId = c.getAssignedWorkerId() != null ? c.getAssignedWorkerId().toLowerCase().trim() : "";
            String assignedName = c.getAssignedWorkerName() != null ? c.getAssignedWorkerName().toLowerCase().replaceAll("\\(.*?\\)", "").trim() : "";

            // 1. Direct match on worker ID or Email or Name in assignedWorkerId
            if (!assignedId.isEmpty()) {
                if (assignedId.equalsIgnoreCase(cleanId) || assignedId.equalsIgnoreCase(cleanEmail) ||
                    (!cleanName.isEmpty() && (assignedId.contains(cleanName) || cleanName.contains(assignedId)))) {
                    return true;
                }
            }

            // 2. Direct match on assignedWorkerName
            if (!assignedName.isEmpty() && !cleanName.isEmpty()) {
                if (assignedName.contains(cleanName) || cleanName.contains(assignedName)) {
                    return true;
                }
            }

            return false;
        }).toList();
    }

    public List<Complaint> getComplaintsForWorker(String workerId, String workerName, String ward) {
        return getComplaintsForWorker(workerId, workerName, null, ward);
    }

    public Complaint createComplaint(Complaint complaint) {
        if (complaint.getId() == null || complaint.getId().isEmpty()) {
            complaint.setId("cmp_" + System.currentTimeMillis());
        }
        if (complaint.getTrackingNumber() == null || complaint.getTrackingNumber().isEmpty()) {
            complaint.setTrackingNumber("TRK-" + (100000 + (int)(Math.random() * 900000)));
        }

        if (complaint.getStatus() == null) {
            complaint.setStatus("PENDING");
        }

        if (complaint.getPriority() == null || complaint.getPriority().isEmpty()) {
            complaint.setPriority("MEDIUM");
        }

        if (complaint.getDueDate() == null) {
            complaint.setDueDate(LocalDateTime.now().withHour(18).withMinute(0));
        }

        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());

        // Initial timeline entry
        String citizenName = complaint.getCitizenName() != null ? complaint.getCitizenName() : "Citizen";
        complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
            "Complaint Filed",
            "Grievance registered in system for ward " + complaint.getWard(),
            citizenName,
            "CITIZEN",
            "PENDING"
        ));

        Complaint saved = complaintRepository.save(complaint);

        auditService.logActivity(
            saved.getCitizenId(),
            citizenName,
            "CITIZEN",
            "Submitted Complaint",
            "COMPLAINT",
            saved.getTrackingNumber(),
            "Grievance submitted: \"" + saved.getTitle() + "\" in " + saved.getWard()
        );

        // Persistent notification to councillor
        notificationService.createNotification(new Notification(
            "COUNCILLOR",
            "New Complaint Filed",
            "New grievance #" + saved.getTrackingNumber() + " submitted in " + saved.getWard(),
            "COMPLAINT",
            "/councillor/dashboard"
        ));

        return saved;
    }

    public Complaint updateStatus(String id, String status) {
        if (status == null || !VALID_STATUSES.contains(status.toUpperCase().trim())) {
            throw new IllegalArgumentException("Invalid status value.");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        String oldStatus = complaint.getStatus();
        String newStat = status.toUpperCase().trim();
        complaint.setStatus(newStat);
        complaint.setUpdatedAt(LocalDateTime.now());

        complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
            "Status Updated",
            "Status changed from " + oldStatus + " to " + newStat,
            "System Admin",
            "ADMIN",
            newStat
        ));

        Complaint saved = complaintRepository.save(complaint);

        auditService.logActivity(
            "system",
            "System / Admin",
            "ADMIN",
            "Updated Complaint Status",
            "COMPLAINT",
            saved.getTrackingNumber(),
            "Status changed from " + oldStatus + " to " + saved.getStatus()
        );

        return saved;
    }

    public Complaint assignWorker(String id, Map<String, String> body) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        
        String workerId = body.get("workerId");
        String workerName = body.get("workerName");
        String priority = body.get("priority");
        String dueDateStr = body.get("dueDate");

        complaint.setAssignedWorkerId(workerId);
        complaint.setAssignedWorkerName(workerName);
        complaint.setAssignedDate(LocalDateTime.now());
        complaint.setStatus("ASSIGNED");

        if (priority != null && !priority.trim().isEmpty()) {
            complaint.setPriority(priority.toUpperCase().trim());
        }

        if (dueDateStr != null && !dueDateStr.trim().isEmpty()) {
            try {
                if (dueDateStr.contains("T")) {
                    complaint.setDueDate(LocalDateTime.parse(dueDateStr));
                } else {
                    complaint.setDueDate(LocalDateTime.parse(dueDateStr + "T18:00:00"));
                }
            } catch (Exception e) {
                complaint.setDueDate(LocalDateTime.now().withHour(18).withMinute(0));
            }
        } else if (complaint.getDueDate() == null) {
            complaint.setDueDate(LocalDateTime.now().withHour(18).withMinute(0));
        }

        complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
            "Worker Assigned",
            "Assigned for field action to technician " + workerName,
            "Ward Councillor",
            "COUNCILLOR",
            "ASSIGNED"
        ));

        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint saved = complaintRepository.save(complaint);

        auditService.logActivity(
            "admin",
            "Councillor / Admin",
            "COUNCILLOR",
            "Assigned Task to Worker",
            "WORKER_TASK",
            saved.getTrackingNumber(),
            "Assigned complaint \"" + saved.getTitle() + "\" to technician " + workerName
        );

        // Persistent notification to worker & citizen
        if (workerId != null) {
            notificationService.createNotification(new Notification(
                workerId,
                "New Field Repair Task",
                "You have been assigned work order #" + saved.getTrackingNumber() + " (" + saved.getTitle() + ")",
                "TASK",
                "/worker/assigned"
            ));
        }
        if (saved.getCitizenId() != null) {
            notificationService.createNotification(new Notification(
                saved.getCitizenId(),
                "Field Technician Assigned",
                "Your complaint #" + saved.getTrackingNumber() + " has been assigned to field technician " + workerName,
                "COMPLAINT",
                "/citizen/history/" + saved.getId()
            ));
        }

        return saved;
    }

    public Complaint startTask(String id, String workerId, String workerName) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        complaint.setStatus("IN_PROGRESS");
        if (complaint.getAssignedDate() == null) {
            complaint.setAssignedDate(LocalDateTime.now());
        }

        String wName = workerName != null ? workerName : (complaint.getAssignedWorkerName() != null ? complaint.getAssignedWorkerName() : "Field Technician");
        complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
            "Work Initiated",
            "Technician arrived on site and initiated repair work",
            wName,
            "WORKER",
            "IN_PROGRESS"
        ));

        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint saved = complaintRepository.save(complaint);

        auditService.logActivity(
            workerId != null ? workerId : complaint.getAssignedWorkerId(),
            wName,
            "WORKER",
            "Started Task",
            "WORKER_TASK",
            saved.getTrackingNumber(),
            "Field technician arrived on site for " + saved.getTrackingNumber()
        );

        return saved;
    }

    public Complaint completeTask(String id, String workerId, String workerName, String notes, String afterImage, String beforeImage) {
        if (afterImage == null || afterImage.trim().isEmpty()) {
            throw new IllegalArgumentException("A valid resolved/after photo is mandatory to mark a task as completed.");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        complaint.setStatus("PENDING_APPROVAL");
        if (notes != null && !notes.trim().isEmpty()) {
            complaint.setWorkerNotes(notes);
        }
        complaint.setAfterImage(afterImage);
        complaint.setCompletionImage(afterImage);

        if (beforeImage != null && !beforeImage.trim().isEmpty()) {
            complaint.setBeforeImage(beforeImage);
        }

        String workerDisplayName = workerName != null && !workerName.trim().isEmpty() ? workerName : (complaint.getAssignedWorkerName() != null ? complaint.getAssignedWorkerName() : "Worker");

        complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
            "Repair Completed & Proof Uploaded",
            "Field work completed. Resolved photo proof attached for councillor verification",
            workerDisplayName,
            "WORKER",
            "PENDING_APPROVAL"
        ));

        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint saved = complaintRepository.save(complaint);

        auditService.logActivity(
            workerId != null ? workerId : complaint.getAssignedWorkerId(),
            workerDisplayName,
            "WORKER",
            "Submitted Completion Proof",
            "WORKER_TASK",
            saved.getTrackingNumber(),
            workerDisplayName + " completed work on " + saved.getTrackingNumber() + " and submitted proof"
        );

        // Notify councillor for approval
        notificationService.createNotification(new Notification(
            "COUNCILLOR",
            "Proof Verification Required",
            workerDisplayName + " uploaded completion evidence for #" + saved.getTrackingNumber(),
            "PROOF_SUBMITTED",
            "/councillor/dashboard"
        ));

        return saved;
    }

    public Complaint approveTask(String id, String councillorId, String councillorName) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        complaint.setStatus("RESOLVED");
        String cName = councillorName != null && !councillorName.trim().isEmpty() ? councillorName : "Ward Councillor";

        complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
            "Resolution Verified & Approved",
            cName + " verified site evidence and officially APPROVED complaint resolution",
            cName,
            "COUNCILLOR",
            "RESOLVED"
        ));

        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint saved = complaintRepository.save(complaint);

        auditService.logActivity(
            councillorId != null ? councillorId : "councillor",
            cName,
            "COUNCILLOR",
            "Verified & Approved Task",
            "COMPLAINT",
            saved.getTrackingNumber(),
            cName + " approved resolution for " + saved.getTrackingNumber()
        );

        // Persistent notification to citizen
        if (saved.getCitizenId() != null) {
            notificationService.createNotification(new Notification(
                saved.getCitizenId(),
                "Complaint Officially Resolved!",
                "Your complaint #" + saved.getTrackingNumber() + " has been verified & resolved by Ward Councillor " + cName,
                "WORK_RESOLVED",
                "/citizen/history/" + saved.getId()
            ));
        }

        return saved;
    }

    public Complaint rejectTaskProof(String id, String councillorId, String councillorName, String feedback) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        complaint.setStatus("IN_PROGRESS");
        String fb = (feedback != null && !feedback.trim().isEmpty()) ? feedback.trim() : "Proof insufficient";
        complaint.setWorkerNotes("REWORK REQUESTED: " + fb);

        String cName = councillorName != null && !councillorName.trim().isEmpty() ? councillorName : "Ward Councillor";

        complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
            "Rework Requested",
            "Councillor requested rework: " + fb,
            cName,
            "COUNCILLOR",
            "IN_PROGRESS"
        ));

        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint saved = complaintRepository.save(complaint);

        auditService.logActivity(
            councillorId != null ? councillorId : "councillor",
            cName,
            "COUNCILLOR",
            "Requested Rework",
            "COMPLAINT",
            saved.getTrackingNumber(),
            cName + " requested rework for " + saved.getTrackingNumber() + ": " + fb
        );

        if (saved.getAssignedWorkerId() != null) {
            notificationService.createNotification(new Notification(
                saved.getAssignedWorkerId(),
                "Rework Requested by Councillor",
                "Councillor requested rework on #" + saved.getTrackingNumber() + ": " + fb,
                "TASK",
                "/worker/assigned"
            ));
        }

        return saved;
    }

    public Complaint reportDelay(String id, String workerId, String workerName, String reason, String notes, String delayImage) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        complaint.setDelayReason(reason);
        complaint.setDelayNotes(notes);
        if (delayImage != null && !delayImage.trim().isEmpty()) {
            complaint.setDelayImage(delayImage);
        }

        String wName = workerName != null ? workerName : (complaint.getAssignedWorkerName() != null ? complaint.getAssignedWorkerName() : "Technician");

        complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
            "Task Delay Reported",
            "Technician reported delay: " + reason + (notes != null ? " (" + notes + ")" : ""),
            wName,
            "WORKER",
            complaint.getStatus()
        ));

        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint saved = complaintRepository.save(complaint);

        auditService.logActivity(
            workerId != null ? workerId : complaint.getAssignedWorkerId(),
            wName,
            "WORKER",
            "Reported Task Delay",
            "WORKER_TASK",
            saved.getTrackingNumber(),
            "Reported delay: \"" + reason + "\""
        );

        return saved;
    }

    public Complaint addComment(String id, String authorName, String authorRole, String content, String authorAvatar) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        Complaint.ComplaintComment comment = new Complaint.ComplaintComment(authorName, authorRole, content, authorAvatar);
        complaint.getComments().add(comment);

        complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
            "Comment Added",
            authorName + " (" + authorRole + "): " + content,
            authorName,
            authorRole,
            complaint.getStatus()
        ));

        complaint.setUpdatedAt(LocalDateTime.now());
        return complaintRepository.save(complaint);
    }

    public void deleteComplaint(String id) {
        complaintRepository.deleteById(id);
    }

    public void deleteAllComplaints() {
        complaintRepository.deleteAll();
    }
}
