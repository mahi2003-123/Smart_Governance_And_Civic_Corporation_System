package com.sgcs.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "notification_reads", indexes = {
    @Index(name = "idx_notification_reads_user", columnList = "user_id")
})
public class NotificationRead {

    @EmbeddedId
    private NotificationReadId id;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    public NotificationRead() {
        this.readAt = LocalDateTime.now();
    }

    public NotificationRead(String notificationId, String userId) {
        this.id = new NotificationReadId(notificationId, userId);
        this.readAt = LocalDateTime.now();
    }

    public NotificationReadId getId() { return id; }
    public void setId(NotificationReadId id) { this.id = id; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    @Embeddable
    public static class NotificationReadId implements Serializable {
        @Column(name = "notification_id", length = 100)
        private String notificationId;

        @Column(name = "user_id", length = 100)
        private String userId;

        public NotificationReadId() {}

        public NotificationReadId(String notificationId, String userId) {
            this.notificationId = notificationId;
            this.userId = userId;
        }

        public String getNotificationId() { return notificationId; }
        public void setNotificationId(String notificationId) { this.notificationId = notificationId; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            NotificationReadId that = (NotificationReadId) o;
            return Objects.equals(notificationId, that.notificationId) && Objects.equals(userId, that.userId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(notificationId, userId);
        }
    }
}
