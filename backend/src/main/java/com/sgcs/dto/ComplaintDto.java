package com.sgcs.dto;

import com.sgcs.entity.Complaint;
import java.time.LocalDateTime;

public class ComplaintDto {
    private String id;
    private String trackingNumber;
    private String title;
    private String category;
    private String priority;
    private String description;
    private String ward;
    private String locationAddress;
    private String status;
    private String citizenId;
    private String citizenName;
    private String citizenPhone;
    private String assignedWorkerId;
    private String assignedWorkerName;
    private String images;
    private String completionImage;
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

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public String getCompletionImage() { return completionImage; }
    public void setCompletionImage(String completionImage) { this.completionImage = completionImage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
