package com.sgcs.service;

import com.sgcs.entity.Complaint;
import com.sgcs.entity.Notification;
import com.sgcs.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import com.sgcs.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ComplaintService {
    private static final Logger logger = LoggerFactory.getLogger(ComplaintService.class);

    private static final List<String> VALID_STATUSES = List.of("PENDING", "ASSIGNED", "IN_PROGRESS", "PENDING_APPROVAL", "RESOLVED", "REJECTED");

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private FirebaseNotificationService firebaseNotificationService;

    @Autowired
    private com.sgcs.repository.UserRepository userRepository;

    @Autowired
    @Qualifier("aiRestTemplate")
    private RestTemplate restTemplate;

    @Value("${ai.service.url:https://smart-governance-and-civic-corporation-7q2c.onrender.com}")
    private String aiServiceUrl;

    public List<String> getAiCandidateBaseUrls() {
        List<String> urls = new ArrayList<>();
        if (aiServiceUrl != null && !aiServiceUrl.trim().isEmpty()) {
            urls.add(aiServiceUrl.trim());
        }
        String livePrimary = "https://smart-governance-and-civic-corporation-7q2c.onrender.com";
        if (!urls.contains(livePrimary)) {
            urls.add(livePrimary);
        }
        String liveLegacy = "https://sgcs-ai-service.onrender.com";
        if (!urls.contains(liveLegacy)) {
            urls.add(liveLegacy);
        }
        return urls;
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Complaint> getActiveComplaints() {
        return complaintRepository.findAll().stream()
            .filter(c -> List.of("PENDING", "ASSIGNED", "IN_PROGRESS").contains(c.getStatus().toUpperCase()))
            .toList();
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
        if (workerId == null || workerId.trim().isEmpty()) {
            return List.of();
        }
        String cleanId = workerId.trim();
        return complaintRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(c -> cleanId.equals(c.getAssignedWorkerId()))
                .toList();
    }

    public List<Complaint> getComplaintsForWorker(String workerId, String workerName, String ward) {
        return getComplaintsForWorker(workerId, workerName, null, ward);
    }

    public Complaint createComplaint(Complaint complaint) {
        if (complaint.getId() == null || complaint.getId().isEmpty()) {
            complaint.setId("cmp_" + UUID.randomUUID().toString());
        }
        if (complaint.getTrackingNumber() == null || complaint.getTrackingNumber().isEmpty()) {
            complaint.setTrackingNumber("TRK-" + (100000 + (int)(Math.random() * 900000)));
        }

        if (complaint.getStatus() == null) {
            complaint.setStatus("PENDING");
        }

        if (complaint.getCategory() == null || complaint.getCategory().isEmpty()) {
            complaint.setCategory("OTHER");
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

        // First save: persists the complaint immediately — AI enrichment comes after
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

        // If complaint is submitted as URGENT, dispatch high-priority alert to ward officials immediately
        if ("URGENT".equalsIgnoreCase(saved.getPriority())) {
            notificationService.createNotification(new Notification(
                "ward_" + saved.getWard(),
                "EMERGENCY: Urgent Complaint Filed",
                "Urgent grievance #" + saved.getTrackingNumber() + " (" + saved.getTitle() + ") requires immediate inspection in " + saved.getWard(),
                "COMPLAINT",
                "/councillor/dashboard"
            ));
        }

        // AI enrichment — complaint creation MUST NOT fail if the AI service is unavailable
        saved.setAiStatus("PENDING");
        try {
            // 1. Classification
            Map<String, String> aiRequest = new HashMap<>();
            String classificationText = (saved.getTitle() != null && !saved.getTitle().trim().isEmpty() ? saved.getTitle().trim() + ". " : "") + 
                                       (saved.getDescription() != null ? saved.getDescription().trim() : "");
            aiRequest.put("complaint_text", classificationText);
            ResponseEntity<Map> aiResponse = null;
            for (String baseUrl : getAiCandidateBaseUrls()) {
                String cleanBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
                for (String endpoint : List.of("/predict", "/ai/classify-complaint", "/classify")) {
                    try {
                        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
                        org.springframework.http.HttpEntity<Map<String, String>> aiEntity = new org.springframework.http.HttpEntity<>(aiRequest, headers);

                        aiResponse = restTemplate.postForEntity(cleanBase + endpoint, aiEntity, Map.class);
                        if (aiResponse != null && aiResponse.getStatusCode().is2xxSuccessful() && aiResponse.getBody() != null) {
                            break;
                        }
                    } catch (Exception ex) {
                        logger.debug("AI classification attempt failed at {}{}: {}", cleanBase, endpoint, ex.getMessage());
                    }
                }
                if (aiResponse != null && aiResponse.getStatusCode().is2xxSuccessful() && aiResponse.getBody() != null) {
                    break;
                }
            }

            if (aiResponse != null && aiResponse.getStatusCode().is2xxSuccessful() && aiResponse.getBody() != null) {
                Map<String, Object> body = aiResponse.getBody();
                String predictedCat = (String) body.get("category");
                saved.setAiSuggestedCategory(predictedCat);
                Object conf = body.get("confidence");
                double parsedConf = 0.0;
                if (conf instanceof Number) {
                    parsedConf = ((Number) conf).doubleValue();
                    saved.setAiConfidence(parsedConf);
                }
                if (parsedConf < 0.25) {
                    saved.setAiSuggestedCategory("OTHER");
                }
                if (body.get("model") != null) {
                    saved.setAiModel((String) body.get("model"));
                }
                saved.setAiStatus("COMPLETED");

                // If citizen selected "Other" or "Auto-Detect" or left category empty, adopt AI category
                if (predictedCat != null && parsedConf >= 0.25 && !"OTHER".equalsIgnoreCase(predictedCat)) {
                    String currentCat = saved.getCategory();
                    if (currentCat == null || currentCat.trim().isEmpty() || 
                        "Other".equalsIgnoreCase(currentCat.trim()) || 
                        "AUTO".equalsIgnoreCase(currentCat.trim()) ||
                        "Auto-Detect".equalsIgnoreCase(currentCat.trim())) {
                        saved.setCategory(predictedCat.toUpperCase().trim());
                    }
                }
            } else {
                saved.setAiStatus("UNAVAILABLE");
                if (saved.getCategory() == null || saved.getCategory().isEmpty()) {
                    saved.setCategory("OTHER");
                }
                if (saved.getPriority() == null || saved.getPriority().isEmpty()) {
                    saved.setPriority("MEDIUM");
                }
            }

            // 2. Duplicate Detection
            final String currentComplaintId = saved.getId();
            List<Complaint> activeComplaints = getActiveComplaints().stream()
                .filter(c -> !c.getId().equals(currentComplaintId))
                .toList();

            if (!activeComplaints.isEmpty()) {
                Map<String, Object> dupReq = new HashMap<>();
                String newFullText = (saved.getTitle() != null && !saved.getTitle().trim().isEmpty() ? saved.getTitle().trim() + ". " : "") + 
                                     (saved.getDescription() != null ? saved.getDescription().trim() : "");
                dupReq.put("new_complaint", newFullText);
                dupReq.put("new_ward", saved.getWard());
                dupReq.put("new_location", saved.getLocationAddress());
                dupReq.put("new_category", (saved.getCategory() != null && !saved.getCategory().equalsIgnoreCase("Other")) ? saved.getCategory() : (saved.getAiSuggestedCategory() != null ? saved.getAiSuggestedCategory() : ""));
                dupReq.put("new_created_at", saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : java.time.LocalDateTime.now().toString());

                List<Map<String, String>> existingList = new ArrayList<>();
                for (Complaint ac : activeComplaints) {
                    Map<String, String> item = new HashMap<>();
                    item.put("id", ac.getId());
                    String acFullText = (ac.getTitle() != null && !ac.getTitle().trim().isEmpty() ? ac.getTitle().trim() + ". " : "") + 
                                        (ac.getDescription() != null ? ac.getDescription().trim() : "");
                    item.put("text", acFullText);
                    item.put("ward", ac.getWard());
                    item.put("location", ac.getLocationAddress());
                    String acCat = (ac.getCategory() != null && !ac.getCategory().equalsIgnoreCase("Other")) ? ac.getCategory() : (ac.getAiSuggestedCategory() != null ? ac.getAiSuggestedCategory() : "");
                    item.put("category", acCat);
                    item.put("status", ac.getStatus() != null ? ac.getStatus() : "");
                    item.put("created_at", ac.getCreatedAt() != null ? ac.getCreatedAt().toString() : "");
                    existingList.add(item);
                }
                dupReq.put("existing_complaints", existingList);

                ResponseEntity<Map> dupRes = null;
                for (String baseUrl : getAiCandidateBaseUrls()) {
                    String cleanBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
                    for (String endpoint : List.of("/ai/duplicate-check", "/duplicate-check")) {
                        try {
                            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
                            org.springframework.http.HttpEntity<Map<String, Object>> dupEntity = new org.springframework.http.HttpEntity<>(dupReq, headers);

                            dupRes = restTemplate.postForEntity(cleanBase + endpoint, dupEntity, Map.class);
                            if (dupRes != null && dupRes.getStatusCode().is2xxSuccessful() && dupRes.getBody() != null) {
                                break;
                            }
                        } catch (Exception ex) {
                            logger.debug("AI duplicate check attempt failed at {}{}: {}", cleanBase, endpoint, ex.getMessage());
                        }
                    }
                    if (dupRes != null && dupRes.getStatusCode().is2xxSuccessful() && dupRes.getBody() != null) {
                        break;
                    }
                }

                if (dupRes != null && dupRes.getStatusCode().is2xxSuccessful() && dupRes.getBody() != null) {
                    Map<String, Object> body = dupRes.getBody();
                    String possId = (String) body.get("possible_duplicate_id");
                    Object sim = body.get("similarity");
                    if (possId != null) {
                        saved.setPossibleDuplicateId(possId);
                        if (sim instanceof Number) {
                            saved.setDuplicateSimilarityScore(((Number) sim).doubleValue());
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("AI Service completely unavailable — complaint saved with default category/priority: {}", e.getMessage());
            saved.setAiStatus("UNAVAILABLE");
            if (saved.getCategory() == null || saved.getCategory().isEmpty()) {
                saved.setCategory("OTHER");
            }
            if (saved.getPriority() == null || saved.getPriority().isEmpty()) {
                saved.setPriority("MEDIUM");
            }
        }

        // Second save: persist AI enrichment results onto the already-created entity
        saved = complaintRepository.save(saved);

        return saved;
    }

    public Complaint reviewAiCategory(String id, String category, String councillorId, String councillorName) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
                
        String oldCategory = complaint.getCategory();
        complaint.setCategory(category);
        complaint.setIsAiCategoryAccepted(true);
        
        complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
            "Category Confirmed",
            "Category set to " + category,
            councillorName,
            "COUNCILLOR",
            complaint.getStatus()
        ));
        
        Complaint saved = complaintRepository.save(complaint);
        auditService.logActivity(
            councillorId, councillorName, "COUNCILLOR", "CATEGORY_CHANGED", "COMPLAINT", saved.getTrackingNumber(),
            "Category changed from " + oldCategory + " to " + category + " (AI Suggested: " + saved.getAiSuggestedCategory() + ")"
        );
        return saved;
    }

    public Complaint linkDuplicate(String id, String masterId, boolean isDuplicate, String councillorId, String councillorName) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
                
        complaint.setIsDuplicateConfirmed(isDuplicate);
        if (isDuplicate) {
            complaint.setMasterComplaintId(masterId);
            Complaint master = complaintRepository.findById(masterId).orElse(null);
            if (master != null) {
                complaint.setStatus("LINKED");
                
                complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
                    "Linked to Master Ticket",
                    "This complaint was linked to an existing issue: " + master.getTrackingNumber(),
                    councillorName,
                    "COUNCILLOR",
                    "LINKED"
                ));
                
                // Notify Citizen
                if (complaint.getCitizenId() != null) {
                    notificationService.createNotification(new Notification(
                        complaint.getCitizenId(),
                        "Complaint Linked",
                        "Your complaint has been linked to an existing civic issue #" + master.getTrackingNumber(),
                        "COMPLAINT",
                        "/citizen/history/" + complaint.getId()
                    ));
                }
            }
        } else {
            complaint.setMasterComplaintId(null);
        }
        
        Complaint saved = complaintRepository.save(complaint);
        auditService.logActivity(
            councillorId, councillorName, "COUNCILLOR", "DUPLICATE_LINKED", "COMPLAINT", saved.getTrackingNumber(),
            isDuplicate ? ("Linked to master ticket: " + masterId) : "Marked as separate complaint"
        );
        return saved;
    }

    public Complaint updateStatus(String id, String status) {
        if (status == null || !VALID_STATUSES.contains(status.toUpperCase().trim())) {
            throw new IllegalArgumentException("Invalid status value.");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

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
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        
        String oldWorkerId = complaint.getAssignedWorkerId();
        String oldPriority = complaint.getPriority();
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
                "/worker/tasks"
            ));
            
            if ("URGENT".equalsIgnoreCase(saved.getPriority())) {
                boolean priorityChangedToUrgent = !"URGENT".equalsIgnoreCase(oldPriority);
                boolean workerChanged = oldWorkerId == null || !oldWorkerId.equalsIgnoreCase(workerId);
                
                if (priorityChangedToUrgent || workerChanged) {
                    firebaseNotificationService.sendUrgentTaskPushNotification(
                        workerId, saved.getId(), saved.getTrackingNumber(), saved.getTitle(), saved.getWard(), saved.getLocationAddress()
                    ).thenAccept(outcome -> {
                        auditService.logActivity(workerId, workerName, "WORKER", "URGENT PUSH " + outcome, "NOTIFICATION", saved.getTrackingNumber(), "URGENT PUSH " + outcome);
                    }).exceptionally(ex -> {
                        logger.error("Push notification failed", ex);
                        auditService.logActivity(workerId, workerName, "WORKER", "URGENT PUSH failed", "NOTIFICATION", saved.getTrackingNumber(), "URGENT PUSH failed: " + ex.getMessage());
                        return null;
                    });
                }
            }
        }
        
        if (oldWorkerId != null && workerId != null && !oldWorkerId.equalsIgnoreCase(workerId)) {
            notificationService.createNotification(new Notification(
                oldWorkerId,
                "Task Transferred",
                "Work order #" + saved.getTrackingNumber() + " has been transferred to another technician.",
                "TASK",
                "/worker/tasks"
            ));
            if ("URGENT".equalsIgnoreCase(oldPriority)) {
                firebaseNotificationService.sendTaskTransferredPushNotification(oldWorkerId, saved.getTrackingNumber(), saved.getTitle());
            }
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
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

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
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

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
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

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
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

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
                "/worker/tasks"
            ));
        }
        return saved;
    }

    public Complaint reportDelay(String id, String workerId, String workerName, String reason, String notes, String delayImage) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

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
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

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
        if (!complaintRepository.existsById(id)) {
            throw new ResourceNotFoundException("Complaint not found with id: " + id);
        }
        complaintRepository.deleteById(id);
    }

    public void deleteAllComplaints() {
        complaintRepository.deleteAll();
    }

    public void checkPriorityAccess(Complaint complaint, String role, String ward) {
        if ("COUNCILLOR".equalsIgnoreCase(role)) {
            if (ward == null || !ward.equalsIgnoreCase(complaint.getWard())) {
                throw new SecurityException("Access Denied: You do not have permission to modify this ward's complaint.");
            }
        } else if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new SecurityException("Access Denied: Only Admins or Ward Councillors can modify priority.");
        }
    }

    public Complaint updatePriority(String id, String newPriority, String updatedById, String updatedByName, String updatedByRole, String userWard) {
        if (newPriority == null || !List.of("LOW", "MEDIUM", "HIGH", "URGENT").contains(newPriority.toUpperCase().trim())) {
            throw new IllegalArgumentException("Invalid priority: must be LOW, MEDIUM, HIGH, or URGENT");
        }
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        checkPriorityAccess(complaint, updatedByRole, userWard);

        String oldPriority = complaint.getPriority();
        String priority = newPriority.toUpperCase().trim();
        if (priority.equalsIgnoreCase(oldPriority)) {
            return complaint;
        }

        complaint.setPriority(priority);
        complaint.setUpdatedAt(LocalDateTime.now());

        String timelineTitle = "URGENT".equals(priority) ? "Priority changed to URGENT" : "Priority Updated";
        complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
            timelineTitle,
            "Priority changed from " + (oldPriority != null ? oldPriority : "None") + " to " + priority,
            updatedByName != null ? updatedByName : "Admin",
            updatedByRole,
            complaint.getStatus()
        ));

        Complaint saved = complaintRepository.save(complaint);
        auditService.logActivity(updatedById != null ? updatedById : "system", updatedByName, updatedByRole, "Updated Priority", "COMPLAINT", saved.getTrackingNumber(), "Priority changed to " + priority);

        if ("URGENT".equals(priority) && !"URGENT".equalsIgnoreCase(oldPriority)) {
            // 1. If assigned to worker, send urgent push to worker
            if (saved.getAssignedWorkerId() != null) {
                firebaseNotificationService.sendUrgentTaskPushNotification(
                    saved.getAssignedWorkerId(), saved.getId(), saved.getTrackingNumber(), saved.getTitle(), saved.getWard(), saved.getLocationAddress()
                ).thenAccept(outcome -> {
                    auditService.logActivity(saved.getAssignedWorkerId(), saved.getAssignedWorkerName(), "WORKER", "URGENT PUSH " + outcome, "NOTIFICATION", saved.getTrackingNumber(), "URGENT PUSH " + outcome);
                }).exceptionally(ex -> {
                    logger.error("Push notification failed", ex);
                    auditService.logActivity(saved.getAssignedWorkerId(), saved.getAssignedWorkerName(), "WORKER", "URGENT PUSH failed", "NOTIFICATION", saved.getTrackingNumber(), "URGENT PUSH failed: " + ex.getMessage());
                    return null;
                });
            } else {
                // If not assigned yet, alert ward officials/councillors immediately
                notificationService.createNotification(new Notification(
                    "ward_" + saved.getWard(),
                    "EMERGENCY: Grievance Escalated to URGENT",
                    "Grievance #" + saved.getTrackingNumber() + " in " + saved.getWard() + " has been marked URGENT and requires technician assignment.",
                    "COMPLAINT",
                    "/councillor/dashboard"
                ));
            }

            // 2. Notify the citizen who filed the complaint
            if (saved.getCitizenId() != null) {
                notificationService.createNotification(new Notification(
                    saved.getCitizenId(),
                    "Grievance Priority Escalated to URGENT",
                    "Your grievance #" + saved.getTrackingNumber() + " (" + saved.getTitle() + ") has been escalated to URGENT priority for fast-track resolution.",
                    "COMPLAINT",
                    "/citizen/track?ref=" + saved.getTrackingNumber()
                ));
            }
        }
        return saved;
    }
}
