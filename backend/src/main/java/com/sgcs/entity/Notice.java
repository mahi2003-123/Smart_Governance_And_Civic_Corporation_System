package com.sgcs.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notices")
public class Notice {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private String ward;

    @Column(nullable = false)
    private String priority = "NORMAL"; // NORMAL, IMPORTANT, EMERGENCY

    @Column(name = "published_by", nullable = false)
    private String publishedBy;

    @Column(name = "publish_date")
    private LocalDateTime publishDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    private String category = "General";

    @Column(name = "attachment_url", columnDefinition = "TEXT")
    private String attachmentUrl;

    @Column(name = "attachment_name")
    private String attachmentName;

    @Column(name = "attachment_type")
    private String attachmentType;

    public Notice() {
        this.id = "not_" + UUID.randomUUID().toString();
        this.publishDate = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getPublishedBy() { return publishedBy; }
    public void setPublishedBy(String publishedBy) { this.publishedBy = publishedBy; }

    public LocalDateTime getPublishDate() { return publishDate; }
    public void setPublishDate(LocalDateTime publishDate) { this.publishDate = publishDate; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

    public String getAttachmentType() { return attachmentType; }
    public void setAttachmentType(String attachmentType) { this.attachmentType = attachmentType; }
}
