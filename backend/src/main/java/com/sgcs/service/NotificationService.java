package com.sgcs.service;

import com.sgcs.entity.Notification;
import com.sgcs.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getNotificationsForUser(String userId, String role, String ward) {
        List<String> recipients = new ArrayList<>();
        if (userId != null && !userId.isEmpty()) recipients.add(userId);
        recipients.add("ALL");
        if (role != null && !role.isEmpty()) recipients.add(role.toUpperCase());
        if (ward != null && !ward.isEmpty()) recipients.add("ward_" + ward);

        return notificationRepository.findByRecipientIdInOrderByCreatedAtDesc(recipients);
    }

    public Notification createNotification(Notification notification) {
        if (notification.getId() == null || notification.getId().isEmpty()) {
            notification.setId("notif_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000));
        }
        return notificationRepository.save(notification);
    }

    public Notification createNotification(String recipientId, String title, String message, String type, String linkUrl) {
        Notification n = new Notification(recipientId != null ? recipientId : "ALL", title, message, type, linkUrl);
        return createNotification(n);
    }

    public Notification markAsRead(String id) {
        Optional<Notification> opt = notificationRepository.findById(id);
        if (opt.isPresent()) {
            Notification n = opt.get();
            n.setRead(true);
            return notificationRepository.save(n);
        }
        throw new RuntimeException("Notification not found with id: " + id);
    }

    public void markAllAsReadForUser(String userId, String role, String ward) {
        List<Notification> list = getNotificationsForUser(userId, role, ward);
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }

    public void deleteAllNotifications() {
        notificationRepository.deleteAll();
    }
}
