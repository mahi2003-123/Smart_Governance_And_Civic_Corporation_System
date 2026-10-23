package com.sgcs.dto;

import com.sgcs.entity.Complaint;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class ComplaintDto {
    private String id;
    private String trackingNumber;

    @NotBlank(message = "Complaint title is required")
    private String title;

    @NotBlank(message = "Complaint category is required")
    private String category;

    private String priority;

    @NotBlank(message = "Complaint description is required")
    private String description;

    @NotBlank(message = "Ward location is required")
    private String ward;

    private String locationAddress;
    private String status;
    private String citizenId;
    private String citizenName;
    private String citizenPhone;
    private String assignedWorkerId;
    private String assignedWorkerName;
    private java.util.List<String> images;
    private String completionImage;
    private LocalDateTime assignedDate;
    private LocalDateTime dueDate;
    private String beforeImage;
    private String afterImage;
    private String workerNotes;
    private String delayReason;
    private String delayNotes;
    private String delayImage;
    private String aiSuggestedCategory;
    private Double aiConfidence;
    private Boolean isAiCategoryAccepted;
    private String masterComplaintId;
    private String possibleDuplicateId;
    private Double duplicateSimilarityScore;
    private Boolean isDuplicateConfirmed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ComplaintDto() {}

    public ComplaintDto(Complaint complaint) {
        this.id = complaint.getId();
        this.trackingNumber = complaint.getTrackingNumber();
        this.title = complaint.getTitle();
        this.category = complaint.getCategory();
        this.priority = complaint.getPriority();
        this.description = complaint.getDescription();
        this.ward = complaint.getWard();
        this.locationAddress = complaint.getLocationAddress();
        this.status = complaint.getStatus();
        this.citizenId = complaint.getCitizenId();
        this.citizenName = complaint.getCitizenName();
        this.citizenPhone = complaint.getCitizenPhone();
        this.assignedWorkerId = complaint.getAssignedWorkerId();
        this.assignedWorkerName = complaint.getAssignedWorkerName();
        this.images = complaint.getImages();
        this.completionImage = complaint.getCompletionImage();
        this.assignedDate = complaint.getAssignedDate();
        this.dueDate = complaint.getDueDate();
        this.beforeImage = complaint.getBeforeImage();
        this.afterImage = complaint.getAfterImage();
        this.workerNotes = complaint.getWorkerNotes();
        this.delayReason = complaint.getDelayReason();
        this.delayNotes = complaint.getDelayNotes();
        this.delayImage = complaint.getDelayImage();
        this.aiSuggestedCategory = complaint.getAiSuggestedCategory();
        this.aiConfidence = complaint.getAiConfidence();
        this.isAiCategoryAccepted = complaint.getIsAiCategoryAccepted();
        this.masterComplaintId = complaint.getMasterComplaintId();
        this.possibleDuplicateId = complaint.getPossibleDuplicateId();
        this.duplicateSimilarityScore = complaint.getDuplicateSimilarityScore();
        this.isDuplicateConfirmed = complaint.getIsDuplicateConfirmed();
        this.createdAt = complaint.getCreatedAt();
        this.updatedAt = complaint.getUpdatedAt();
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

    public java.util.List<String> getImages() { return images; }
    public void setImages(java.util.List<String> images) { this.images = images; }

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

    public String getAiSuggestedCategory() { return aiSuggestedCategory; }
    public void setAiSuggestedCategory(String aiSuggestedCategory) { this.aiSuggestedCategory = aiSuggestedCategory; }

    public Double getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(Double aiConfidence) { this.aiConfidence = aiConfidence; }

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
}
