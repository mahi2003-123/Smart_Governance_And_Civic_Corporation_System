package com.sgcs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "complaints", indexes = {
    @Index(name = "idx_complaint_ward", columnList = "ward"),
    @Index(name = "idx_complaint_citizen", columnList = "citizen_id"),
    @Index(name = "idx_complaint_status", columnList = "status"),
    @Index(name = "idx_complaint_worker", columnList = "assigned_worker_id"),
    @Index(name = "idx_complaint_created", columnList = "created_at DESC")
})
public class Complaint {

    @Id
    private String id;

    @Column(name = "tracking_number", nullable = false, unique = true)
    private String trackingNumber;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category; // Roads & Potholes, Street Lighting, Water Supply, Waste Management, Sewage & Drainage, etc.

    @Column(nullable = false)
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String ward;

    @Column(name = "location_address", nullable = false)
    private String locationAddress;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, IN_PROGRESS, RESOLVED, REJECTED

    @Column(name = "citizen_id", nullable = false)
    private String citizenId;

    @Column(name = "citizen_name", nullable = false)
    private String citizenName;

    @Column(name = "citizen_phone")
    private String citizenPhone;

    @Column(name = "assigned_worker_id")
    private String assignedWorkerId;

    @Column(name = "assigned_worker_name")
    private String assignedWorkerName;

    @Column(name = "assigned_date")
    private LocalDateTime assignedDate;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "worker_notes", columnDefinition = "TEXT")
    private String workerNotes;

    @Column(name = "delay_reason")
    private String delayReason;

    @Column(name = "delay_notes", columnDefinition = "TEXT")
    private String delayNotes;

    // AI & Duplicate Tracking
    @Column(name = "ai_suggested_category")
    private String aiSuggestedCategory;

    @Column(name = "ai_confidence")
    private Double aiConfidence;
    
    @Column(name = "ai_model")
    private String aiModel;

    @Column(name = "ai_status")
    private String aiStatus;

    @Column(name = "is_ai_category_accepted")
    private Boolean isAiCategoryAccepted;

    @Column(name = "master_complaint_id")
    private String masterComplaintId;

    @Column(name = "possible_duplicate_id")
    private String possibleDuplicateId;

    @Column(name = "duplicate_similarity_score")
    private Double duplicateSimilarityScore;

    @Column(name = "is_duplicate_confirmed")
    private Boolean isDuplicateConfirmed;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnore
    private List<ComplaintAttachment> attachments = new ArrayList<>();

    @Embeddable
    public static class ComplaintComment {
        private String id;

        @Column(name = "author_name", nullable = false)
        private String authorName;

        @Column(name = "author_role")
        private String authorRole = "CITIZEN";

        @Column(name = "author_avatar", columnDefinition = "TEXT")
        private String authorAvatar;

        @Column(columnDefinition = "TEXT", nullable = false)
        private String content;

        @Column(name = "created_at")
        private LocalDateTime createdAt;

        public ComplaintComment() {
            this.id = "cmt_" + UUID.randomUUID().toString();
            this.createdAt = LocalDateTime.now();
        }

        public ComplaintComment(String authorName, String authorRole, String content, String authorAvatar) {
            this.id = "cmt_" + UUID.randomUUID().toString();
            this.authorName = authorName;
            this.authorRole = authorRole != null ? authorRole : "CITIZEN";
            this.content = content;
            this.authorAvatar = authorAvatar;
            this.createdAt = LocalDateTime.now();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }

        public String getAuthorRole() { return authorRole; }
        public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }

        public String getAuthorAvatar() { return authorAvatar; }
        public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    @Embeddable
    public static class ComplaintTimelineItem {
        private String id;

        private String title;

        @Column(columnDefinition = "TEXT")
        private String description;

        private LocalDateTime timestamp;

        @Column(name = "actor_name")
        private String actorName;

        @Column(name = "actor_role")
        private String actorRole;

        private String status;

        public ComplaintTimelineItem() {
            this.id = "tl_" + UUID.randomUUID().toString();
            this.timestamp = LocalDateTime.now();
        }

        public ComplaintTimelineItem(String title, String description, String actorName, String actorRole, String status) {
            this.id = "tl_" + UUID.randomUUID().toString();
            this.title = title;
            this.description = description;
            this.timestamp = LocalDateTime.now();
            this.actorName = actorName;
            this.actorRole = actorRole;
            this.status = status;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

        public String getActorName() { return actorName; }
        public void setActorName(String actorName) { this.actorName = actorName; }

        public String getActorRole() { return actorRole; }
        public void setActorRole(String actorRole) { this.actorRole = actorRole; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "complaint_comments", joinColumns = @JoinColumn(name = "complaint_id"))
    private List<ComplaintComment> comments = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "complaint_timeline", joinColumns = @JoinColumn(name = "complaint_id"))
    private List<ComplaintTimelineItem> timeline = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Complaint() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getLocationAddress() { return locationAddress; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCitizenId() { return citizenId; }
    public void setCitizenId(String citizenId) { this.citizenId = citizenId; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public String getCitizenPhone() { return citizenPhone; }
    public void setCitizenPhone(String citizenPhone) { this.citizenPhone = citizenPhone; }

    public String getAssignedWorkerId() { return assignedWorkerId; }
    public void setAssignedWorkerId(String assignedWorkerId) { this.assignedWorkerId = assignedWorkerId; }

    public String getAssignedWorkerName() { return assignedWorkerName; }
    public void setAssignedWorkerName(String assignedWorkerName) { this.assignedWorkerName = assignedWorkerName; }

    public LocalDateTime getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDateTime assignedDate) { this.assignedDate = assignedDate; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public String getWorkerNotes() { return workerNotes; }
    public void setWorkerNotes(String workerNotes) { this.workerNotes = workerNotes; }

    public String getDelayReason() { return delayReason; }
    public void setDelayReason(String delayReason) { this.delayReason = delayReason; }

    public String getDelayNotes() { return delayNotes; }
    public void setDelayNotes(String delayNotes) { this.delayNotes = delayNotes; }

    public String getAiSuggestedCategory() { return aiSuggestedCategory; }
    public void setAiSuggestedCategory(String aiSuggestedCategory) { this.aiSuggestedCategory = aiSuggestedCategory; }

    public Double getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(Double aiConfidence) { this.aiConfidence = aiConfidence; }

    public String getAiModel() { return aiModel; }
    public void setAiModel(String aiModel) { this.aiModel = aiModel; }

    public String getAiStatus() { return aiStatus; }
    public void setAiStatus(String aiStatus) { this.aiStatus = aiStatus; }

    public Boolean getIsAiCategoryAccepted() { return isAiCategoryAccepted; }
    public void setIsAiCategoryAccepted(Boolean isAiCategoryAccepted) { this.isAiCategoryAccepted = isAiCategoryAccepted; }

    public String getMasterComplaintId() { return masterComplaintId; }
    public void setMasterComplaintId(String masterComplaintId) { this.masterComplaintId = masterComplaintId; }

    public String getPossibleDuplicateId() { return possibleDuplicateId; }
    public void setPossibleDuplicateId(String possibleDuplicateId) { this.possibleDuplicateId = possibleDuplicateId; }

    public Double getDuplicateSimilarityScore() { return duplicateSimilarityScore; }
    public void setDuplicateSimilarityScore(Double duplicateSimilarityScore) { this.duplicateSimilarityScore = duplicateSimilarityScore; }

    public Boolean getIsDuplicateConfirmed() { return isDuplicateConfirmed; }
    public void setIsDuplicateConfirmed(Boolean isDuplicateConfirmed) { this.isDuplicateConfirmed = isDuplicateConfirmed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<ComplaintComment> getComments() { return comments; }
    public void setComments(List<ComplaintComment> comments) { this.comments = comments; }

    public List<ComplaintTimelineItem> getTimeline() { return timeline; }
    public void setTimeline(List<ComplaintTimelineItem> timeline) { this.timeline = timeline; }

    public List<ComplaintAttachment> getAttachments() { return attachments; }
    public void setAttachments(List<ComplaintAttachment> attachments) { this.attachments = attachments; }

    // --- Attachment Helper Methods & Transient Fields for Backward Compatibility ---

    public void addAttachment(String kind, String dataUrl) {
        if (dataUrl == null || dataUrl.trim().isEmpty()) return;
        if (this.attachments == null) this.attachments = new ArrayList<>();
        ComplaintAttachment att = new ComplaintAttachment(this, kind, dataUrl.trim());
        this.attachments.add(att);
    }

    public void setAttachment(String kind, String dataUrl) {
        if (this.attachments == null) this.attachments = new ArrayList<>();
        this.attachments.removeIf(a -> kind.equalsIgnoreCase(a.getKind()));
        if (dataUrl != null && !dataUrl.trim().isEmpty()) {
            addAttachment(kind, dataUrl);
        }
    }

    private String findAttachmentUrl(String kind) {
        if (attachments == null) return null;
        return attachments.stream()
            .filter(a -> kind.equalsIgnoreCase(a.getKind()))
            .map(ComplaintAttachment::getDataUrl)
            .findFirst()
            .orElse(null);
    }

    @Transient
    @JsonProperty("images")
    public List<String> getImages() {
        if (attachments == null || attachments.isEmpty()) return new ArrayList<>();
        return attachments.stream()
            .filter(a -> "REPORT".equalsIgnoreCase(a.getKind()))
            .map(ComplaintAttachment::getDataUrl)
            .collect(Collectors.toList());
    }

    public void setImages(List<?> imagesList) {
        if (this.attachments == null) this.attachments = new ArrayList<>();
        this.attachments.removeIf(a -> "REPORT".equalsIgnoreCase(a.getKind()));
        if (imagesList != null) {
            for (Object obj : imagesList) {
                if (obj != null) {
                    addAttachment("REPORT", obj.toString());
                }
            }
        }
    }

    public void setImages(String imagesStr) {
        if (this.attachments == null) this.attachments = new ArrayList<>();
        this.attachments.removeIf(a -> "REPORT".equalsIgnoreCase(a.getKind()));
        if (imagesStr != null && !imagesStr.trim().isEmpty()) {
            String[] parts = imagesStr.split(",(?=(?:data:|http))");
            for (String p : parts) {
                if (!p.trim().isEmpty()) {
                    addAttachment("REPORT", p.trim());
                }
            }
        }
    }

    @Transient
    @JsonProperty("beforeImage")
    public String getBeforeImage() {
        return findAttachmentUrl("BEFORE");
    }

    public void setBeforeImage(String beforeImage) {
        setAttachment("BEFORE", beforeImage);
    }

    @Transient
    @JsonProperty("afterImage")
    public String getAfterImage() {
        return findAttachmentUrl("AFTER");
    }

    public void setAfterImage(String afterImage) {
        setAttachment("AFTER", afterImage);
    }

    @Transient
    @JsonProperty("completionImage")
    public String getCompletionImage() {
        String c = findAttachmentUrl("COMPLETION");
        return c != null ? c : findAttachmentUrl("AFTER");
    }

    public void setCompletionImage(String completionImage) {
        setAttachment("COMPLETION", completionImage);
    }

    @Transient
    @JsonProperty("delayImage")
    public String getDelayImage() {
        return findAttachmentUrl("DELAY");
    }

    public void setDelayImage(String delayImage) {
        setAttachment("DELAY", delayImage);
    }
}
