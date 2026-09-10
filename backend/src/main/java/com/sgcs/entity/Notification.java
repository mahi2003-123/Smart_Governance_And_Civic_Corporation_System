package com.sgcs.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    private String id;

    @Column(name = "recipient_id", nullable = false)
    private String recipientId; // Can be specific userId, 'ALL', role name (e.g. WORKER), or ward

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false)
    private String type; // COMPLAINT, NOTICE, PROPOSAL, FEEDBACK, TASK

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "link_url")
    private String linkUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Notification() {
        this.id = "notif_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String recipientId, String title, String message, String type, String linkUrl) {
        this.id = "notif_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
        this.recipientId = recipientId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.linkUrl = linkUrl;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public String getLinkUrl() { return linkUrl; }
    public void setLinkUrl(String linkUrl) { this.linkUrl = linkUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
