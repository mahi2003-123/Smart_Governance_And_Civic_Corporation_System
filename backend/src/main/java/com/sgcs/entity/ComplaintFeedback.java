package com.sgcs.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaint_feedback", uniqueConstraints = {
    @UniqueConstraint(name = "uq_complaint_citizen_feedback", columnNames = {"complaint_id", "citizen_id"})
}, indexes = {
    @Index(name = "idx_complaint_feedback_complaint", columnList = "complaint_id"),
    @Index(name = "idx_complaint_feedback_citizen", columnList = "citizen_id")
})
public class ComplaintFeedback {

    @Id
    private UUID id;

    @Column(name = "complaint_id", nullable = false, length = 100)
    private String complaintId;

    @Column(name = "citizen_id", nullable = false, length = 100)
    private String citizenId;

    @Column(nullable = false)
    private Short rating; // 1-5

    @Column(nullable = false)
    private Boolean satisfied;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public ComplaintFeedback() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
    }

    public ComplaintFeedback(String complaintId, String citizenId, Short rating, Boolean satisfied, String comment) {
        this.id = UUID.randomUUID();
        this.complaintId = complaintId;
        this.citizenId = citizenId;
        this.rating = rating;
        this.satisfied = satisfied;
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getComplaintId() { return complaintId; }
    public void setComplaintId(String complaintId) { this.complaintId = complaintId; }

    public String getCitizenId() { return citizenId; }
    public void setCitizenId(String citizenId) { this.citizenId = citizenId; }

    public Short getRating() { return rating; }
    public void setRating(Short rating) { this.rating = rating; }

    public Boolean getSatisfied() { return satisfied; }
    public void setSatisfied(Boolean satisfied) { this.satisfied = satisfied; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
