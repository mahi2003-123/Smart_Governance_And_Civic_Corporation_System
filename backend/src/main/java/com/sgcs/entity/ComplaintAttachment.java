package com.sgcs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaint_attachments", indexes = {
    @Index(name = "idx_complaint_attachments_complaint", columnList = "complaint_id"),
    @Index(name = "idx_complaint_attachments_kind", columnList = "kind")
})
public class ComplaintAttachment {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    @JsonIgnore
    private Complaint complaint;

    @Column(nullable = false, length = 50)
    private String kind;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "size_bytes")
    private Integer sizeBytes;

    @Column(name = "data_url", columnDefinition = "TEXT", nullable = false)
    private String dataUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public ComplaintAttachment() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
    }

    public ComplaintAttachment(Complaint complaint, String kind, String dataUrl) {
        this.id = UUID.randomUUID();
        this.complaint = complaint;
        this.kind = kind;
        this.dataUrl = dataUrl;
        this.createdAt = LocalDateTime.now();
        if (dataUrl != null && dataUrl.startsWith("data:")) {
            int semi = dataUrl.indexOf(';');
            if (semi > 5) {
                this.contentType = dataUrl.substring(5, semi);
            }
            this.sizeBytes = dataUrl.length();
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }

    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Integer getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(Integer sizeBytes) { this.sizeBytes = sizeBytes; }

    public String getDataUrl() { return dataUrl; }
    public void setDataUrl(String dataUrl) { this.dataUrl = dataUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
