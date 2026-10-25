package com.sgcs.service;

import com.sgcs.entity.Complaint;
import com.sgcs.entity.Notification;
import com.sgcs.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import com.sgcs.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.Collections;
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
    private com.sgcs.security.AccessGuard accessGuard;

    @Autowired
    @Qualifier("aiRestTemplate")
    private RestTemplate restTemplate;

    @Autowired(required = false)
    private com.sgcs.security.ImageValidator imageValidator;

    @Value("${ai.service.url:}")
    private String aiServiceUrl;

    @Value("${ai.internal.key:}")
    private String aiInternalKey;

    public List<String> getAiCandidateBaseUrls() {
        List<String> urls = new ArrayList<>();
        if (aiServiceUrl != null && !aiServiceUrl.trim().isEmpty()) {
            urls.add(aiServiceUrl.trim());
        }
        return urls;
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Complaint> getActiveComplaints() {
        return complaintRepository.findActiveComplaints();
    }

    public Optional<Complaint> getComplaintById(String id) {
        return complaintRepository.findByIdOrTrackingNumber(id, id);
    }

    public List<Complaint> getComplaintsByCitizen(String citizenId) {
        return complaintRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
    }

    public List<Complaint> getComplaintsByWard(String ward) {
        if (ward == null || ward.trim().isEmpty() || "ALL".equalsIgnoreCase(ward.trim())) {
            return complaintRepository.findAllByOrderByCreatedAtDesc();
        }
        return complaintRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(c -> c.getWard() != null && accessGuard.isSameWard(c.getWard(), ward))
                .toList();
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

    private final java.security.SecureRandom secureRandom = new java.security.SecureRandom();

    public Complaint createComplaint(com.sgcs.dto.CreateComplaintRequest request, com.sgcs.security.UserPrincipal principal) {
        Complaint complaint = new Complaint();
        complaint.setId("cmp_" + UUID.randomUUID().toString());

        String trackingNumber;
        int attempts = 0;
        do {
            int rand = 1000 + secureRandom.nextInt(9000);
            trackingNumber = "SGCS-" + java.time.Year.now().getValue() + "-" + rand;
            attempts++;
        } while (complaintRepository.existsByTrackingNumber(trackingNumber) && attempts < 20);

        complaint.setTrackingNumber(trackingNumber);
        complaint.setTitle(request.getTitle() != null ? request.getTitle().trim() : "");
        complaint.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        complaint.setCategory(request.getCategory() != null && !request.getCategory().trim().isEmpty() ? request.getCategory().trim() : "OTHER");
        complaint.setWard(request.getWard() != null ? request.getWard().trim() : "");
        complaint.setLocationAddress(request.getLocationAddress() != null ? request.getLocationAddress().trim() : "");
        complaint.setStatus("PENDING");

        String reqPriority = request.getPriority() != null ? request.getPriority().trim().toUpperCase() : "MEDIUM";
        if ("URGENT".equals(reqPriority) || "HIGH".equals(reqPriority) || "CRITICAL".equals(reqPriority)) {
            complaint.setPriority("MEDIUM");
        } else if ("LOW".equals(reqPriority) || "MEDIUM".equals(reqPriority)) {
            complaint.setPriority(reqPriority);
        } else {
            complaint.setPriority("MEDIUM");
        }

        if (request.getImages() != null) {
            if (imageValidator != null) {
                imageValidator.validateComplaintImages(request.getImages());
            }
            if (request.getImages() instanceof List<?> list) {
                complaint.setImages(String.join(",", list.stream().map(Object::toString).toList()));
            } else {
                complaint.setImages(request.getImages().toString());
            }
        }

        complaint.setCitizenId(principal.getId());
        complaint.setCitizenName(principal.getFullName());
        complaint.setCitizenPhone(principal.getPhone());

        return createComplaint(complaint);
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
        
        // 1. Classification (Remote AI with fail-safe built-in classification engine)
        try {
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
                        if (aiInternalKey != null && !aiInternalKey.trim().isEmpty()) {
                            headers.set("X-Internal-Key", aiInternalKey.trim());
                        }
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
                applyBuiltInClassificationFallback(saved, classificationText);
            }
        } catch (Exception e) {
            logger.warn("Remote AI classification failed, using built-in civic engine: {}", e.getMessage());
            String classificationText = (saved.getTitle() != null && !saved.getTitle().trim().isEmpty() ? saved.getTitle().trim() + ". " : "") + 
                                       (saved.getDescription() != null ? saved.getDescription().trim() : "");
            applyBuiltInClassificationFallback(saved, classificationText);
        }

        // 2. High-Accuracy Duplicate Detection (Dual-Engine: Embedded Semantic Proximity + Remote AI)
        try {
            runDuplicateDetection(saved);
        } catch (Exception e) {
            logger.warn("Duplicate detection encountered an error: {}", e.getMessage(), e);
        }

        // Second save: persist AI enrichment results onto the already-created entity
        saved = complaintRepository.save(saved);

        return saved;
    }

    public Map<String, Object> predictCategory(String text) {
        if (text == null || text.trim().isEmpty()) {
            return Map.of("category", "OTHER", "confidence", 0.1, "priority", "MEDIUM", "model", "SGCS-Embedded-Civic-Engine");
        }
        Map<String, String> aiRequest = new HashMap<>();
        aiRequest.put("complaint_text", text.trim());
        for (String baseUrl : getAiCandidateBaseUrls()) {
            String cleanBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
            for (String endpoint : List.of("/predict", "/ai/classify-complaint", "/classify")) {
                try {
                    org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                    headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
                    if (aiInternalKey != null && !aiInternalKey.trim().isEmpty()) {
                        headers.set("X-Internal-Key", aiInternalKey.trim());
                    }
                    org.springframework.http.HttpEntity<Map<String, String>> aiEntity = new org.springframework.http.HttpEntity<>(aiRequest, headers);
                    ResponseEntity<Map> resp = restTemplate.postForEntity(cleanBase + endpoint, aiEntity, Map.class);
                    if (resp != null && resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                        return resp.getBody();
                    }
                } catch (Exception ignored) {
                }
            }
        }
        return classifyWithBuiltInCivicEngine(text.trim());
    }

    public Map<String, Object> classifyWithBuiltInCivicEngine(String text) {
        if (text == null || text.trim().isEmpty()) {
            return Map.of(
                "category", "OTHER",
                "confidence", 0.10,
                "priority", "LOW",
                "model", "SGCS-Embedded-Civic-Engine"
            );
        }
        String clean = text.toLowerCase().trim();
        String priority = estimateBuiltInPriority(clean);

        // 1. DRAINAGE (including water logging & stagnant water disambiguation)
        if (clean.contains("water logging") || clean.contains("waterlogging") || clean.contains("stagnant water") ||
            clean.contains("drain") || clean.contains("drainage") || clean.contains("sewer") ||
            clean.contains("sewage") || clean.contains("gutter") || clean.contains("manhole") ||
            clean.contains("nullah") || clean.contains("culvert blocked") || clean.contains("sullage")) {
            return Map.of(
                "category", "DRAINAGE",
                "confidence", 0.985,
                "priority", priority,
                "model", "SGCS-Embedded-Civic-Engine"
            );
        }

        // 2. STREET_LIGHT
        if (clean.contains("street light") || clean.contains("streetlight") || clean.contains("lamp post") ||
            clean.contains("pole light") || clean.contains("dark street") || clean.contains("pitch dark") ||
            clean.contains("fused bulb") || clean.contains("light fixture") || clean.contains("high mast") ||
            clean.contains("flickering light") || clean.contains("wire hanging from pole") || clean.contains("bulb burnt") ||
            clean.contains("street lamp") || clean.contains("lighting")) {
            return Map.of(
                "category", "STREET_LIGHT",
                "confidence", 0.992,
                "priority", priority,
                "model", "SGCS-Embedded-Civic-Engine"
            );
        }

        // 3. ROAD & POTHOLES
        if (clean.contains("pothole") || clean.contains("potholes") || clean.contains("road broken") ||
            clean.contains("damaged road") || clean.contains("crater") || clean.contains("craters") ||
            clean.contains("asphalt") || clean.contains("bitumen") || clean.contains("tar road") ||
            clean.contains("speed breaker") || clean.contains("speed bump") || clean.contains("road divider") ||
            clean.contains("road cave") || clean.contains("pavement damaged") || clean.contains("footpath broken") ||
            clean.contains("paver block") || clean.contains("bumpy road") || clean.contains("uneven road") ||
            clean.contains("road resurfacing") || clean.contains("dug up road")) {
            return Map.of(
                "category", "ROAD",
                "confidence", 0.991,
                "priority", priority,
                "model", "SGCS-Embedded-Civic-Engine"
            );
        }

        // 4. WATER_SUPPLY
        if (clean.contains("drinking water") || clean.contains("tap water") || clean.contains("pipeline leak") ||
            clean.contains("pipe burst") || clean.contains("water supply") || clean.contains("no water") ||
            clean.contains("water shortage") || clean.contains("low water pressure") || clean.contains("muddy water") ||
            clean.contains("dirty drinking water") || clean.contains("contaminated water") || clean.contains("water meter") ||
            clean.contains("water valve") || clean.contains("borewell") || clean.contains("water tanker")) {
            return Map.of(
                "category", "WATER_SUPPLY",
                "confidence", 0.988,
                "priority", priority,
                "model", "SGCS-Embedded-Civic-Engine"
            );
        }

        // 5. WASTE_MANAGEMENT
        if (clean.contains("garbage") || clean.contains("trash") || clean.contains("waste dumped") ||
            clean.contains("dustbin") || clean.contains("litter") || clean.contains("rotting") ||
            clean.contains("dead animal") || clean.contains("carcass") || clean.contains("plastic waste") ||
            clean.contains("sanitation worker") || clean.contains("solid waste") || clean.contains("debris dumped") ||
            clean.contains("rubble") || clean.contains("stench from garbage") || clean.contains("street sweeping")) {
            return Map.of(
                "category", "WASTE_MANAGEMENT",
                "confidence", 0.989,
                "priority", priority,
                "model", "SGCS-Embedded-Civic-Engine"
            );
        }

        // 6. PUBLIC_SPACE
        if (clean.contains("park") || clean.contains("playground") || clean.contains("public garden") ||
            clean.contains("garden") || clean.contains("bench") || clean.contains("benches") ||
            clean.contains("swing") || clean.contains("swings") || clean.contains("slide") ||
            clean.contains("open gym") || clean.contains("walking track") || clean.contains("jogging track") ||
            clean.contains("fountain") || clean.contains("public toilet in park") || clean.contains("community hall") ||
            clean.contains("gazebo") || clean.contains("statue") || clean.contains("botanical garden")) {
            return Map.of(
                "category", "PUBLIC_SPACE",
                "confidence", 0.986,
                "priority", priority,
                "model", "SGCS-Embedded-Civic-Engine"
            );
        }

        return Map.of(
            "category", "OTHER",
            "confidence", 0.20,
            "priority", "MEDIUM",
            "model", "SGCS-Embedded-Civic-Engine"
        );
    }

    private String estimateBuiltInPriority(String cleanText) {
        if (cleanText.contains("accident") || cleanText.contains("danger") || cleanText.contains("hazard") ||
            cleanText.contains("live wire") || cleanText.contains("electric shock") || cleanText.contains("spark") ||
            cleanText.contains("pipe burst flooding") || cleanText.contains("deep crater") || cleanText.contains("sinkhole") ||
            cleanText.contains("pedestrian fell") || cleanText.contains("emergency") || cleanText.contains("urgent")) {
            return "URGENT";
        }
        if (cleanText.contains("overflowing") || cleanText.contains("completely blocked") || cleanText.contains("stinking") ||
            cleanText.contains("dengue") || cleanText.contains("no water for days") || cleanText.contains("pitch dark")) {
            return "HIGH";
        }
        return "MEDIUM";
    }

    private void applyBuiltInClassificationFallback(Complaint saved, String classificationText) {
        Map<String, Object> fallback = classifyWithBuiltInCivicEngine(classificationText);
        String predictedCat = (String) fallback.get("category");
        double parsedConf = ((Number) fallback.get("confidence")).doubleValue();
        saved.setAiSuggestedCategory(predictedCat);
        saved.setAiConfidence(parsedConf);
        saved.setAiModel((String) fallback.get("model"));
        saved.setAiStatus("COMPLETED");

        if (predictedCat != null && parsedConf >= 0.25 && !"OTHER".equalsIgnoreCase(predictedCat)) {
            String currentCat = saved.getCategory();
            if (currentCat == null || currentCat.trim().isEmpty() || 
                "Other".equalsIgnoreCase(currentCat.trim()) || 
                "AUTO".equalsIgnoreCase(currentCat.trim()) ||
                "Auto-Detect".equalsIgnoreCase(currentCat.trim())) {
                saved.setCategory(predictedCat.toUpperCase().trim());
            }
        }
    }

    public static class DuplicateResult {
        private final String masterId;
        private final double score;
        private final String matchReason;

        public DuplicateResult(String masterId, double score, String matchReason) {
            this.masterId = masterId;
            this.score = score;
            this.matchReason = matchReason;
        }

        public String getMasterId() { return masterId; }
        public double getScore() { return score; }
        public String getMatchReason() { return matchReason; }
    }

    private static final Set<String> STOP_WORDS = Set.of(
        "the", "is", "at", "which", "on", "a", "an", "and", "or", "in", "near", "to",
        "for", "of", "from", "by", "with", "it", "this", "that", "there", "very", "please",
        "has", "have", "been", "my", "our", "are", "was", "were", "sir", "madam",
        "complaint", "issue", "problem", "kindly", "request", "help", "urgently", "action",
        "take", "area", "ward", "colony", "block", "nagar"
    );

    private static final Set<String> CIVIC_HIGH_WEIGHT_KEYWORDS = Set.of(
        "pothole", "potholes", "crater", "craters", "asphalt", "tar", "road", "street", "crack", "cracks", "patchwork", "divider", "speedbreaker",
        "pipe", "pipeline", "leak", "leakage", "burst", "water", "drinking", "contamination", "dirty", "smell", "pressure", "valve", "tank", "tap",
        "light", "lamp", "streetlight", "pole", "dark", "darkness", "bulb", "flicker", "flickering", "wiring", "shortcircuit", "illumination",
        "garbage", "trash", "waste", "dump", "dumping", "bin", "dustbin", "overflow", "litter", "debris", "stench", "cleaning", "sweeping",
        "drain", "drainage", "clog", "clogged", "sewer", "sewage", "gutter", "manhole", "nullah", "waterlogging", "water logging", "stagnant"
    );

    public void runDuplicateDetection(Complaint saved) {
        final String currentComplaintId = saved.getId();
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusDays(180);
        double[] savedCoords = extractCoordinates(saved.getLocationAddress());
        
        List<Complaint> rawCandidates = complaintRepository.findRecentActiveComplaints(sixMonthsAgo);
        if (rawCandidates == null || rawCandidates.isEmpty()) {
            rawCandidates = complaintRepository.findRecentActiveComplaintsByWard(
                saved.getWard() != null ? saved.getWard().trim() : "",
                sixMonthsAgo,
                org.springframework.data.domain.PageRequest.of(0, 200)
            );
        }
        if (rawCandidates == null || rawCandidates.isEmpty()) {
            rawCandidates = complaintRepository.findActiveComplaints();
        }
        if (rawCandidates == null) {
            rawCandidates = Collections.emptyList();
        }

        List<Complaint> candidates = rawCandidates.stream()
            .filter(c -> c != null && c.getId() != null && !c.getId().equals(currentComplaintId))
            .filter(c -> {
                if (saved.getWard() == null || saved.getWard().trim().isEmpty() ||
                    c.getWard() == null || c.getWard().trim().isEmpty()) {
                    return true;
                }
                if (checkWardsMatch(c.getWard(), saved.getWard())) {
                    return true;
                }
                double[] cCoords = extractCoordinates(c.getLocationAddress());
                if (savedCoords != null && cCoords != null) {
                    return calculateHaversineMeters(savedCoords[0], savedCoords[1],
                                                   cCoords[0], cCoords[1]) < 500.0;
                }
                return false;
            })
            .toList();

        DuplicateResult builtInResult = detectDuplicateWithBuiltInCivicEngine(saved, candidates);

        String bestDuplicateId = null;
        Double bestScore = null;

        if (builtInResult != null) {
            bestDuplicateId = builtInResult.getMasterId();
            bestScore = builtInResult.getScore();
        }

        // Also query remote AI microservice if accessible
        if (!candidates.isEmpty()) {
            try {
                Map<String, Object> dupReq = new HashMap<>();
                String newFullText = (saved.getTitle() != null && !saved.getTitle().trim().isEmpty() ? saved.getTitle().trim() + ". " : "") + 
                                     (saved.getDescription() != null ? saved.getDescription().trim() : "");
                dupReq.put("new_complaint", newFullText);
                dupReq.put("new_ward", saved.getWard());
                dupReq.put("new_location", saved.getLocationAddress());
                if (savedCoords != null) {
                    dupReq.put("new_latitude", savedCoords[0]);
                    dupReq.put("new_longitude", savedCoords[1]);
                }
                dupReq.put("new_category", resolveEffectiveCategory(saved));
                dupReq.put("new_created_at", saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : java.time.LocalDateTime.now().toString());

                List<Map<String, Object>> existingList = new ArrayList<>();
                for (Complaint ac : candidates) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", ac.getId());
                    String acFullText = (ac.getTitle() != null && !ac.getTitle().trim().isEmpty() ? ac.getTitle().trim() + ". " : "") + 
                                        (ac.getDescription() != null ? ac.getDescription().trim() : "");
                    item.put("text", acFullText);
                    item.put("ward", ac.getWard());
                    item.put("location", ac.getLocationAddress());
                    double[] acCoords = extractCoordinates(ac.getLocationAddress());
                    if (acCoords != null) {
                        item.put("latitude", acCoords[0]);
                        item.put("longitude", acCoords[1]);
                    }
                    item.put("category", resolveEffectiveCategory(ac));
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
                            if (aiInternalKey != null && !aiInternalKey.trim().isEmpty()) {
                                headers.set("X-Internal-Key", aiInternalKey.trim());
                            }
                            org.springframework.http.HttpEntity<Map<String, Object>> dupEntity = new org.springframework.http.HttpEntity<>(dupReq, headers);
                            dupRes = restTemplate.postForEntity(cleanBase + endpoint, dupEntity, Map.class);
                            if (dupRes != null && dupRes.getStatusCode().is2xxSuccessful() && dupRes.getBody() != null) {
                                break;
                            }
                        } catch (Exception ignored) {}
                    }
                    if (dupRes != null && dupRes.getStatusCode().is2xxSuccessful() && dupRes.getBody() != null) {
                        break;
                    }
                }

                if (dupRes != null && dupRes.getStatusCode().is2xxSuccessful() && dupRes.getBody() != null) {
                    Map<String, Object> body = dupRes.getBody();
                    String possId = (String) body.get("possible_duplicate_id");
                    Object sim = body.get("similarity");
                    if (possId != null && sim instanceof Number) {
                        double aiScore = ((Number) sim).doubleValue();
                        if (bestScore == null || aiScore > bestScore) {
                            bestDuplicateId = possId;
                            bestScore = aiScore;
                        }
                    }
                }
            } catch (Exception ex) {
                logger.debug("Remote AI duplicate check invocation skipped/failed: {}", ex.getMessage());
            }
        }

        if (bestDuplicateId != null) {
            saved.setPossibleDuplicateId(bestDuplicateId);
            saved.setDuplicateSimilarityScore(bestScore);
            logger.info("Complaint #{} flagged as duplicate of {} with similarity score {}",
                saved.getTrackingNumber(), bestDuplicateId, bestScore);
        }
    }

    public DuplicateResult detectDuplicateWithBuiltInCivicEngine(Complaint newComp, List<Complaint> existingComplaints) {
        if (newComp == null || existingComplaints == null || existingComplaints.isEmpty()) {
            return null;
        }

        String newFullText = (newComp.getTitle() != null ? newComp.getTitle() + ". " : "") +
                             (newComp.getDescription() != null ? newComp.getDescription() : "");
        String newLoc = newComp.getLocationAddress();
        String newCat = resolveEffectiveCategory(newComp);

        Complaint bestMatch = null;
        double highestScore = 0.0;
        String bestReason = "";

        for (Complaint ex : existingComplaints) {
            if (ex.getId() == null || ex.getId().equals(newComp.getId())) continue;

            // 1. Text Similarity
            String exFullText = (ex.getTitle() != null ? ex.getTitle() + ". " : "") +
                                (ex.getDescription() != null ? ex.getDescription() : "");
            double textSim = calculateCivicTextSimilarity(newFullText, exFullText);

            // 2. Location Similarity (GPS or Address)
            double locSim = 0.0;
            boolean hasGps = false;
            double[] c1 = extractCoordinates(newLoc);
            double[] c2 = extractCoordinates(ex.getLocationAddress());
            if (c1 != null && c2 != null) {
                hasGps = true;
                double dist = calculateHaversineMeters(c1[0], c1[1], c2[0], c2[1]);
                if (dist < 40.0) locSim = 1.0;
                else if (dist < 100.0) locSim = 0.88;
                else if (dist < 200.0) locSim = 0.72;
                else if (dist < 400.0) locSim = 0.50;
                else if (dist < 800.0) locSim = 0.25;
                else locSim = 0.05;
            } else {
                locSim = calculateAddressSimilarity(newLoc, ex.getLocationAddress());
            }

            // 3. Category Match
            String exCat = resolveEffectiveCategory(ex);
            double catModifier = 0.0;
            if (!newCat.isEmpty() && !exCat.isEmpty() && !"OTHER".equals(newCat) && !"OTHER".equals(exCat)) {
                if (newCat.equalsIgnoreCase(exCat)) {
                    catModifier = 0.15;
                } else if (isRelatedCategory(newCat, exCat)) {
                    catModifier = 0.05;
                } else {
                    catModifier = -0.20;
                }
            }

            // 4. Temporal Proximity
            double timeModifier = 0.0;
            if (newComp.getCreatedAt() != null && ex.getCreatedAt() != null) {
                long hoursBetween = Math.abs(Duration.between(newComp.getCreatedAt(), ex.getCreatedAt()).toHours());
                if (hoursBetween <= 48) timeModifier = 0.10;
                else if (hoursBetween <= 168) timeModifier = 0.05;
                else if (hoursBetween > 1440) timeModifier = -0.05;
            }

            // 5. Final Combined Score Calculation
            double totalScore;
            if (hasGps && locSim >= 0.70) {
                totalScore = (0.45 * textSim) + (0.40 * locSim) + catModifier + timeModifier;
                if (textSim >= 0.35 && (catModifier >= 0.0)) {
                    totalScore = Math.max(totalScore, 0.75 + (0.20 * textSim));
                }
            } else if (locSim >= 0.40) {
                totalScore = (0.45 * textSim) + (0.35 * locSim) + catModifier + timeModifier;
            } else {
                totalScore = (0.75 * textSim) + (0.10 * locSim) + catModifier + timeModifier;
            }

            if (textSim >= 0.65) {
                totalScore = Math.max(totalScore, textSim + 0.10);
            }

            totalScore = Math.max(0.0, Math.min(0.99, totalScore));

            if (totalScore > highestScore) {
                highestScore = totalScore;
                bestMatch = ex;
                bestReason = String.format("Match with #%s (Text: %.0f%%, Location: %.0f%%)",
                    ex.getTrackingNumber(), textSim * 100, locSim * 100);
            }
        }

        // Calibrated duplicate threshold: 0.48 (48%)
        if (highestScore >= 0.48 && bestMatch != null) {
            return new DuplicateResult(bestMatch.getId(), Math.round(highestScore * 100.0) / 100.0, bestReason);
        }
        return null;
    }

    public Complaint evaluateAndSaveDuplicateCheck(String complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));
        
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusDays(180);
        double[] compCoords = extractCoordinates(complaint.getLocationAddress());

        List<Complaint> rawCandidates = complaintRepository.findRecentActiveComplaints(sixMonthsAgo);
        if (rawCandidates == null || rawCandidates.isEmpty()) {
            rawCandidates = complaintRepository.findRecentActiveComplaintsByWard(
                complaint.getWard() != null ? complaint.getWard().trim() : "",
                sixMonthsAgo,
                org.springframework.data.domain.PageRequest.of(0, 200)
            );
        }
        if (rawCandidates == null || rawCandidates.isEmpty()) {
            rawCandidates = complaintRepository.findActiveComplaints();
        }
        if (rawCandidates == null) {
            rawCandidates = Collections.emptyList();
        }

        List<Complaint> candidates = rawCandidates.stream()
                .filter(c -> c != null && c.getId() != null && !c.getId().equals(complaint.getId()))
                .filter(c -> {
                    if (complaint.getWard() == null || complaint.getWard().trim().isEmpty() ||
                        c.getWard() == null || c.getWard().trim().isEmpty()) {
                        return true;
                    }
                    if (checkWardsMatch(c.getWard(), complaint.getWard())) {
                        return true;
                    }
                    double[] cCoords = extractCoordinates(c.getLocationAddress());
                    if (compCoords != null && cCoords != null) {
                        return calculateHaversineMeters(compCoords[0], compCoords[1],
                                                       cCoords[0], cCoords[1]) < 500.0;
                    }
                    return false;
                })
                .toList();

        DuplicateResult result = detectDuplicateWithBuiltInCivicEngine(complaint, candidates);
        if (result != null) {
            complaint.setPossibleDuplicateId(result.getMasterId());
            complaint.setDuplicateSimilarityScore(result.getScore());
            return complaintRepository.save(complaint);
        } else {
            if (complaint.getPossibleDuplicateId() != null && (complaint.getIsDuplicateConfirmed() == null || !complaint.getIsDuplicateConfirmed())) {
                complaint.setPossibleDuplicateId(null);
                complaint.setDuplicateSimilarityScore(null);
                return complaintRepository.save(complaint);
            }
            return complaint;
        }
    }

    public static double[] extractCoordinates(String location) {
        if (location == null) return null;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("(-?\\d{1,3}\\.\\d{4,})[\\s,]+(-?\\d{1,3}\\.\\d{4,})").matcher(location);
        if (m.find()) {
            try {
                return new double[] { Double.parseDouble(m.group(1)), Double.parseDouble(m.group(2)) };
            } catch (Exception ignored) {}
        }
        return null;
    }

    public static double calculateHaversineMeters(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private double calculateCivicTextSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null) return 0.0;
        Set<String> t1 = extractMeaningfulTokens(text1);
        Set<String> t2 = extractMeaningfulTokens(text2);
        if (t1.isEmpty() || t2.isEmpty()) return 0.0;

        Set<String> inter = new HashSet<>(t1);
        inter.retainAll(t2);
        Set<String> union = new HashSet<>(t1);
        union.addAll(t2);

        double jaccard = (double) inter.size() / union.size();
        double overlap = (double) inter.size() / Math.min(t1.size(), t2.size());

        int civicMatches = 0;
        int totalCivicTerms = 0;
        for (String token : union) {
            if (CIVIC_HIGH_WEIGHT_KEYWORDS.contains(token)) {
                totalCivicTerms++;
                if (inter.contains(token)) {
                    civicMatches++;
                }
            }
        }
        double civicWeight = totalCivicTerms > 0 ? ((double) civicMatches / totalCivicTerms) : 0.0;
        double bigramScore = calculateBigramSimilarity(text1, text2);

        return (0.30 * jaccard) + (0.30 * overlap) + (0.25 * civicWeight) + (0.15 * bigramScore);
    }

    private double calculateAddressSimilarity(String addr1, String addr2) {
        if (addr1 == null || addr2 == null) return 0.0;
        String s1 = addr1.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").trim();
        String s2 = addr2.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").trim();
        if (s1.isEmpty() || s2.isEmpty()) return 0.0;
        if (s1.equals(s2)) return 1.0;

        Set<String> t1 = extractMeaningfulTokens(s1);
        Set<String> t2 = extractMeaningfulTokens(s2);
        if (t1.isEmpty() || t2.isEmpty()) return 0.0;

        Set<String> inter = new HashSet<>(t1);
        inter.retainAll(t2);
        Set<String> union = new HashSet<>(t1);
        union.addAll(t2);

        double jaccard = (double) inter.size() / union.size();
        double overlap = (double) inter.size() / Math.min(t1.size(), t2.size());

        Set<String> num1 = extractDigits(s1);
        Set<String> num2 = extractDigits(s2);
        boolean numbersMatch = !num1.isEmpty() && !num2.isEmpty() && hasCommonElement(num1, num2);

        double score = 0.5 * jaccard + 0.5 * overlap;
        if (numbersMatch && score > 0.25) {
            score = Math.min(1.0, score + 0.20);
        }
        return score;
    }

    private double calculateBigramSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null) return 0.0;
        List<String> b1 = extractBigrams(text1);
        List<String> b2 = extractBigrams(text2);
        if (b1.isEmpty() || b2.isEmpty()) return 0.0;
        Set<String> set1 = new HashSet<>(b1);
        Set<String> set2 = new HashSet<>(b2);
        Set<String> inter = new HashSet<>(set1);
        inter.retainAll(set2);
        return (double) inter.size() / Math.max(1, Math.min(set1.size(), set2.size()));
    }

    private List<String> extractBigrams(String text) {
        String normalized = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").trim();
        String[] words = normalized.split("\\s+");
        List<String> bigrams = new ArrayList<>();
        for (int i = 0; i < words.length - 1; i++) {
            if (words[i].length() > 2 && words[i+1].length() > 2) {
                bigrams.add(words[i] + " " + words[i+1]);
            }
        }
        return bigrams;
    }

    private Set<String> extractMeaningfulTokens(String text) {
        if (text == null || text.trim().isEmpty()) return Collections.emptySet();
        String normalized = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
        String[] words = normalized.split("\\s+");
        Set<String> tokens = new HashSet<>();
        for (String w : words) {
            String trimmed = w.trim();
            if (trimmed.length() > 2 && !STOP_WORDS.contains(trimmed)) {
                tokens.add(trimmed);
            }
        }
        return tokens;
    }

    private Set<String> extractDigits(String text) {
        if (text == null) return Collections.emptySet();
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\b\\d+\\b").matcher(text);
        Set<String> digits = new HashSet<>();
        while (m.find()) {
            digits.add(m.group());
        }
        return digits;
    }

    private boolean hasCommonElement(Set<String> s1, Set<String> s2) {
        for (String item : s1) {
            if (s2.contains(item)) return true;
        }
        return false;
    }

    private String resolveEffectiveCategory(Complaint c) {
        if (c == null) return "";
        if (c.getCategory() != null && !c.getCategory().trim().isEmpty() &&
            !"Other".equalsIgnoreCase(c.getCategory().trim()) &&
            !"Auto-Detect".equalsIgnoreCase(c.getCategory().trim()) &&
            !"AUTO".equalsIgnoreCase(c.getCategory().trim())) {
            return c.getCategory().trim().toUpperCase();
        }
        if (c.getAiSuggestedCategory() != null && !c.getAiSuggestedCategory().trim().isEmpty() &&
            !"OTHER".equalsIgnoreCase(c.getAiSuggestedCategory().trim())) {
            return c.getAiSuggestedCategory().trim().toUpperCase();
        }
        return "";
    }

    private boolean isRelatedCategory(String cat1, String cat2) {
        if (cat1.equalsIgnoreCase(cat2)) return true;
        Set<String> roadDrainage = Set.of("ROAD", "DRAINAGE");
        if (roadDrainage.contains(cat1) && roadDrainage.contains(cat2)) return true;
        Set<String> wastePublic = Set.of("WASTE_MANAGEMENT", "PUBLIC_SPACE");
        if (wastePublic.contains(cat1) && wastePublic.contains(cat2)) return true;
        return false;
    }

    private boolean checkWardsMatch(String wardA, String wardB) {
        if (accessGuard != null) {
            return accessGuard.isSameWard(wardA, wardB);
        }
        if (wardA == null || wardB == null) return false;
        String a = wardA.trim().toLowerCase();
        String b = wardB.trim().toLowerCase();
        if (a.equals(b) || a.contains(b) || b.contains(a)) return true;
        java.util.regex.Matcher m1 = java.util.regex.Pattern.compile("\\d+").matcher(a);
        java.util.regex.Matcher m2 = java.util.regex.Pattern.compile("\\d+").matcher(b);
        if (m1.find() && m2.find()) {
            return m1.group().equals(m2.group());
        }
        return false;
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
            Complaint master = (masterId != null && !masterId.trim().isEmpty())
                    ? complaintRepository.findByIdOrTrackingNumber(masterId.trim(), masterId.trim()).orElse(null)
                    : null;
            String effectiveMasterId = master != null ? master.getId() : (masterId != null ? masterId.trim() : null);
            String masterTracking = master != null ? master.getTrackingNumber() : effectiveMasterId;

            complaint.setMasterComplaintId(effectiveMasterId);
            complaint.setPossibleDuplicateId(effectiveMasterId);
            complaint.setStatus("LINKED");
            
            complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
                "Linked to Master Ticket",
                "This complaint was linked to an existing issue: " + masterTracking,
                councillorName,
                "COUNCILLOR",
                "LINKED"
            ));
            
            // Notify Citizen
            if (complaint.getCitizenId() != null) {
                notificationService.createNotification(new Notification(
                    complaint.getCitizenId(),
                    "Complaint Linked",
                    "Your complaint has been linked to an existing civic issue #" + masterTracking,
                    "COMPLAINT",
                    "/citizen/history/" + complaint.getId()
                ));
            }
        } else {
            complaint.setIsDuplicateConfirmed(false);
            complaint.setMasterComplaintId(null);
            complaint.setPossibleDuplicateId(null);
            complaint.setDuplicateSimilarityScore(null);
            complaint.getTimeline().add(0, new Complaint.ComplaintTimelineItem(
                "Marked as Unique",
                "Complaint verified as unique and separate from potential duplicate tickets.",
                councillorName,
                "COUNCILLOR",
                complaint.getStatus()
            ));
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

        if (imageValidator != null) {
            imageValidator.validateSingleImage(afterImage, "afterImage");
            if (beforeImage != null && !beforeImage.trim().isEmpty()) {
                imageValidator.validateSingleImage(beforeImage, "beforeImage");
            }
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
        if (delayImage != null && !delayImage.trim().isEmpty() && imageValidator != null) {
            imageValidator.validateSingleImage(delayImage, "delayImage");
        }

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
        Complaint complaint = getComplaintById(id)
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
