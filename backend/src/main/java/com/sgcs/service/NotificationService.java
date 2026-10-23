package com.sgcs.service;

import com.sgcs.entity.Notification;
import com.sgcs.entity.NotificationRead;
import com.sgcs.repository.NotificationReadRepository;
import com.sgcs.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationReadRepository notificationReadRepository;

    @Autowired
    private FirebaseNotificationService firebaseNotificationService;

    @Autowired
    private com.sgcs.repository.UserDeviceTokenRepository userDeviceTokenRepository;

    public List<Notification> getNotificationsForUser(String userId, String role, String ward) {
        List<Notification> all = notificationRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        List<Notification> filtered = new ArrayList<>();

        Set<String> readNotificationIds = new HashSet<>();
        if (userId != null) {
            List<NotificationRead> userReads = notificationReadRepository.findByIdUserId(userId);
            for (NotificationRead nr : userReads) {
                readNotificationIds.add(nr.getId().getNotificationId());
            }
        }

        for (Notification n : all) {
            String r = n.getRecipientId();
            boolean match = false;
            if (r == null || "ALL".equalsIgnoreCase(r)) {
                match = true;
            } else if (userId != null && r.equalsIgnoreCase(userId)) {
                match = true;
            } else if (role != null && r.equalsIgnoreCase(role)) {
                match = true;
            } else if (ward != null && r.toLowerCase().startsWith("ward_")) {
                String noticeWard = r.substring(5).trim();
                if (isSameWard(noticeWard, ward)) {
                    match = true;
                }
            }

            if (match) {
                // Determine read status per-user
                boolean isReadForUser = n.isRead();
                if (readNotificationIds.contains(n.getId())) {
                    isReadForUser = true;
                }
                // Clone or set read status for response
                n.setRead(isReadForUser);
                filtered.add(n);
            }
        }
        return filtered;
    }

    public Notification createNotification(Notification notification) {
        if (notification.getLinkUrl() != null && !notification.getLinkUrl().trim().isEmpty()) {
            String link = notification.getLinkUrl().trim();
            if (!link.startsWith("/") || link.startsWith("//")) {
                throw new com.sgcs.exception.BadRequestException("Notification linkUrl must be a relative path starting with '/'");
            }
        }

        if (notification.getId() == null || notification.getId().isEmpty()) {
            notification.setId("notif_" + UUID.randomUUID().toString());
        }
        Notification saved = notificationRepository.save(notification);

        try {
            if (firebaseNotificationService != null) {
                firebaseNotificationService.sendPushNotification(
                    saved.getRecipientId(),
                    saved.getTitle(),
                    saved.getMessage(),
                    saved.getType(),
                    saved.getLinkUrl()
                );
            }
        } catch (Exception e) {
            logger.warn("Could not dispatch FCM push for notification {}: {}", saved.getId(), e.getMessage());
        }

        return saved;
    }

    public Notification createNotification(String recipientId, String title, String message, String type, String linkUrl) {
        Notification n = new Notification(recipientId != null ? recipientId : "ALL", title, message, type, linkUrl);
        return createNotification(n);
    }

    public Notification markAsRead(String id, String userId) {
        Optional<Notification> opt = notificationRepository.findById(id);
        if (opt.isPresent()) {
            Notification n = opt.get();
            if (userId != null) {
                if (!notificationReadRepository.existsByIdNotificationIdAndIdUserId(id, userId)) {
                    notificationReadRepository.save(new NotificationRead(id, userId));
                }
                if (n.getRecipientId() != null && n.getRecipientId().equalsIgnoreCase(userId)) {
                    n.setRead(true);
                    return notificationRepository.save(n);
                }
            } else {
                n.setRead(true);
                return notificationRepository.save(n);
            }
            n.setRead(true);
            return n;
        }
        throw new RuntimeException("Notification not found with id: " + id);
    }

    public void markAllAsReadForUser(String userId, String role, String ward) {
        List<Notification> list = getNotificationsForUser(userId, role, ward);
        List<NotificationRead> newReads = new ArrayList<>();
        List<Notification> directUpdates = new ArrayList<>();

        for (Notification n : list) {
            if (userId != null && !notificationReadRepository.existsByIdNotificationIdAndIdUserId(n.getId(), userId)) {
                newReads.add(new NotificationRead(n.getId(), userId));
            }
            if (userId != null && n.getRecipientId() != null && n.getRecipientId().equalsIgnoreCase(userId)) {
                n.setRead(true);
                directUpdates.add(n);
            }
        }

        if (!newReads.isEmpty()) {
            notificationReadRepository.saveAll(newReads);
        }
        if (!directUpdates.isEmpty()) {
            notificationRepository.saveAll(directUpdates);
        }
    }

    public void deleteAllNotifications() {
        notificationReadRepository.deleteAll();
        notificationRepository.deleteAll();
    }

    public void registerDeviceToken(String userId, String fcmToken, String deviceType, String deviceName) {
        java.util.Optional<com.sgcs.entity.UserDeviceToken> existingOpt = userDeviceTokenRepository.findByFcmToken(fcmToken);
        if (existingOpt.isPresent()) {
            com.sgcs.entity.UserDeviceToken existing = existingOpt.get();
            existing.setUserId(userId);
            existing.setDeviceType(deviceType);
            existing.setDeviceName(deviceName);
            existing.setActive(true);
            existing.setUpdatedAt(LocalDateTime.now());
            userDeviceTokenRepository.save(existing);
        } else {
            com.sgcs.entity.UserDeviceToken token = new com.sgcs.entity.UserDeviceToken(userId, fcmToken, deviceType, deviceName);
            userDeviceTokenRepository.save(token);
        }
    }

    private boolean isSameWard(String wardA, String wardB) {
        if (wardA == null || wardB == null) return false;
        String a = wardA.trim().toLowerCase();
        String b = wardB.trim().toLowerCase();
        if (a.equals(b)) return true;

        if (a.contains("ward ") && b.contains("ward ")) {
            String numA = a.substring(a.indexOf("ward ") + 5).split(" ")[0].split("-")[0].trim();
            String numB = b.substring(b.indexOf("ward ") + 5).split(" ")[0].split("-")[0].trim();
            if (!numA.isEmpty() && numA.equals(numB)) {
                return true;
            }
        }
        return a.contains(b) || b.contains(a);
    }
}
