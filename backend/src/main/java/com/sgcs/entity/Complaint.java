package com.sgcs.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
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

    @Column(name = "location_address")
    private String locationAddress;

    @Column(nullable = false)
    private String status; // PENDING, IN_PROGRESS, RESOLVED, REJECTED

    @Column(name = "citizen_id", nullable = false)
    private String citizenId;

    @Column(name = "citizen_name")
    private String citizenName;

    @Column(name = "citizen_phone")
    private String citizenPhone;

    @Column(name = "assigned_worker_id")
    private String assignedWorkerId;

    @Column(name = "assigned_worker_name")
    private String assignedWorkerName;

    @Column(columnDefinition = "TEXT")
    private String images; // Stored as comma-separated or JSON string

    @Column(name = "completion_image", columnDefinition = "TEXT")
    private String completionImage;

    @Column(name = "assigned_date")
    private LocalDateTime assignedDate;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "before_image", columnDefinition = "TEXT")
    private String beforeImage;

    @Column(name = "after_image", columnDefinition = "TEXT")
    private String afterImage;

    @Column(name = "worker_notes", columnDefinition = "TEXT")
    private String workerNotes;

    @Column(name = "delay_reason")
    private String delayReason;

    @Column(name = "delay_notes", columnDefinition = "TEXT")
    private String delayNotes;

    @Column(name = "delay_image", columnDefinition = "TEXT")
    private String delayImage;

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
            this.id = "cmt_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
            this.createdAt = LocalDateTime.now();
        }

        public ComplaintComment(String authorName, String authorRole, String content, String authorAvatar) {
            this.id = "cmt_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
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
            this.id = "tl_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
            this.timestamp = LocalDateTime.now();
        }

        public ComplaintTimelineItem(String title, String description, String actorName, String actorRole, String status) {
            this.id = "tl_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
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
    private java.util.List<ComplaintComment> comments = new java.util.ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "complaint_timeline", joinColumns = @JoinColumn(name = "complaint_id"))
    private java.util.List<ComplaintTimelineItem> timeline = new java.util.ArrayList<>();

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

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public String getCompletionImage() { return completionImage; }
    public void setCompletionImage(String completionImage) { this.completionImage = completionImage; }

    public LocalDateTime getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDateTime assignedDate) { this.assignedDate = assignedDate; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public String getBeforeImage() { return beforeImage; }
    public void setBeforeImage(String beforeImage) { this.beforeImage = beforeImage; }

    public String getAfterImage() { return afterImage; }
    public void setAfterImage(String afterImage) { this.afterImage = afterImage; }

    public String getWorkerNotes() { return workerNotes; }
    public void setWorkerNotes(String workerNotes) { this.workerNotes = workerNotes; }

    public String getDelayReason() { return delayReason; }
    public void setDelayReason(String delayReason) { this.delayReason = delayReason; }

    public String getDelayNotes() { return delayNotes; }
    public void setDelayNotes(String delayNotes) { this.delayNotes = delayNotes; }

    public String getDelayImage() { return delayImage; }
    public void setDelayImage(String delayImage) { this.delayImage = delayImage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public java.util.List<ComplaintComment> getComments() { return comments; }
    public void setComments(java.util.List<ComplaintComment> comments) { this.comments = comments; }

    public java.util.List<ComplaintTimelineItem> getTimeline() { return timeline; }
    public void setTimeline(java.util.List<ComplaintTimelineItem> timeline) { this.timeline = timeline; }
}
