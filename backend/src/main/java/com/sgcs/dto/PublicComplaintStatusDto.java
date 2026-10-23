package com.sgcs.dto;

import com.sgcs.entity.Complaint;
import java.time.LocalDateTime;
import java.util.List;

public class PublicComplaintStatusDto {
    private String trackingNumber;
    private String title;
    private String status;
    private String category;
    private String ward;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Complaint.ComplaintTimelineItem> timeline;

    public PublicComplaintStatusDto() {}

    public PublicComplaintStatusDto(Complaint complaint) {
        if (complaint != null) {
            this.trackingNumber = complaint.getTrackingNumber();
            this.title = complaint.getTitle();
            this.status = complaint.getStatus();
            this.category = complaint.getCategory();
            this.ward = complaint.getWard();
            this.createdAt = complaint.getCreatedAt();
            this.updatedAt = complaint.getUpdatedAt();
            this.timeline = complaint.getTimeline();
        }
    }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Complaint.ComplaintTimelineItem> getTimeline() { return timeline; }
    public void setTimeline(List<Complaint.ComplaintTimelineItem> timeline) { this.timeline = timeline; }
}
