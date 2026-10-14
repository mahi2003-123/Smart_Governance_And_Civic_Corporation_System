package com.sgcs.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.WebpushConfig;
import com.google.firebase.messaging.WebpushNotification;
import com.sgcs.entity.UserDeviceToken;
import com.sgcs.repository.UserDeviceTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FirebaseNotificationService {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseNotificationService.class);

    @Autowired
    private UserDeviceTokenRepository tokenRepository;

    @Autowired
    private com.sgcs.repository.UserRepository userRepository;

    /**
     * Returns true when FirebaseApp is ready to send messages.
     * Every FCM call must check this to avoid IllegalStateException on no-credentials deployments.
     */
    private boolean isFirebaseReady() {
        return !FirebaseApp.getApps().isEmpty();
    }

    @Async
    public CompletableFuture<String> sendUrgentTaskPushNotification(String workerId, String taskId, String trackingNumber, String complaintTitle, String ward, String location) {
        if (!isFirebaseReady()) {
            logger.warn("Firebase not initialized — skipping urgent push for worker {}. Configure FIREBASE_CREDENTIALS_JSON or /etc/secrets/firebase-admin.json", workerId);
            return CompletableFuture.completedFuture("skipped: firebase disabled");
        }

        List<UserDeviceToken> tokens = tokenRepository.findByUserIdAndActiveTrue(workerId);

        if (tokens.isEmpty()) {
            logger.info("No active FCM tokens found for workerId: {}", workerId);
            return CompletableFuture.completedFuture("skipped: no registered device");
        }

        String locationStr = (location != null && !location.isEmpty()) ? location : ((ward != null && !ward.isEmpty()) ? ward : "Unknown");
        String body = String.format("#%s: %s - %s", trackingNumber, complaintTitle, locationStr);
        if (body.length() > 120) {
            body = body.substring(0, 117) + "...";
        }

        int sent = 0;
        for (UserDeviceToken tokenEntity : tokens) {
            String fcmToken = tokenEntity.getFcmToken();
            try {
                Message message = Message.builder()
                        .setToken(fcmToken)
                        .setNotification(Notification.builder()
                                .setTitle("Urgent Task Assigned")
                                .setBody(body)
                                .build())
                        .putData("type", "URGENT_TASK")
                        .putData("taskId", taskId)
                        .putData("trackingNumber", trackingNumber)
                        .putData("title", "Urgent task assigned")
                        .putData("body", body)
                        .putData("click_action", "/worker/tasks")
                        .setWebpushConfig(WebpushConfig.builder()
                                .putHeader("Urgency", "high")
                                .putHeader("TTL", "3600")
                                .setNotification(WebpushNotification.builder()
                                        .setTitle("Urgent Task Assigned")
                                        .setBody(body)
                                        .setIcon("/vite.svg")
                                        .build())
                                .build())
                        .build();

                String response = FirebaseMessaging.getInstance().send(message);
                logger.info("Successfully sent message for worker {}, response: {}", workerId, response);
                sent++;
            } catch (FirebaseMessagingException e) {
                logger.error("Firebase messaging error: {}", e.getMessage());
                if (e.getMessagingErrorCode() != null) {
                    switch (e.getMessagingErrorCode()) {
                        case INVALID_ARGUMENT:
                        case UNREGISTERED:
                            logger.warn("Marking a token for worker {} as inactive.", workerId);
                            tokenEntity.setActive(false);
                            tokenRepository.save(tokenEntity);
                            break;
                        default:
                            break;
                    }
                }
            } catch (Exception e) {
                logger.error("Error sending FCM message: {}", e.getMessage());
            }
        }
        return CompletableFuture.completedFuture(sent > 0 ? "sent" : "failed");
    }

    @Async
    public void sendTaskTransferredPushNotification(String oldWorkerId, String trackingNumber, String complaintTitle) {
        if (!isFirebaseReady()) {
            logger.debug("Firebase not initialized — skipping transfer push for worker {}", oldWorkerId);
            return;
        }

        List<UserDeviceToken> tokens = tokenRepository.findByUserIdAndActiveTrue(oldWorkerId);
        if (tokens.isEmpty()) return;

        String body = "Urgent work order #" + trackingNumber + " (" + complaintTitle + ") has been transferred away from your queue.";
        if (body.length() > 120) body = body.substring(0, 117) + "...";

        for (UserDeviceToken tokenEntity : tokens) {
            String fcmToken = tokenEntity.getFcmToken();
            try {
                Message message = Message.builder()
                        .setToken(fcmToken)
                        .setNotification(Notification.builder()
                                .setTitle("Task Transferred")
                                .setBody(body)
                                .build())
                        .putData("type", "TASK_TRANSFERRED")
                        .putData("title", "Task Transferred")
                        .putData("body", body)
                        .setWebpushConfig(WebpushConfig.builder()
                                .putHeader("Urgency", "high")
                                .putHeader("TTL", "3600")
                                .setNotification(WebpushNotification.builder()
                                        .setTitle("Task Transferred")
                                        .setBody(body)
                                        .setIcon("/vite.svg")
                                        .build())
                                .build())
                        .build();

                FirebaseMessaging.getInstance().send(message);
            } catch (Exception e) {
                logger.error("Error sending transfer FCM: {}", e.getMessage());
            }
        }
    }

    /**
     * Sends a push notification to device tokens matching the recipient.
     * Recipient can be:
     * - "ALL" -> all active registered devices
     * - "ward_<name>" -> active devices for users in that ward
     * - "CITIZEN", "WORKER", "ADMIN", "COUNCILLOR" -> active devices for users with that role
     * - Specific user ID -> active devices belonging to that user
     */
    @Async
    public CompletableFuture<String> sendPushNotification(String recipientId, String title, String body, String type, String linkUrl) {
        if (!isFirebaseReady()) {
            logger.warn("Firebase not initialized — skipping push notification for recipient '{}'. Configure FIREBASE_CREDENTIALS_JSON or /etc/secrets/firebase-admin.json", recipientId);
            return CompletableFuture.completedFuture("skipped: firebase disabled");
        }

        if (recipientId == null || recipientId.trim().isEmpty()) {
            return CompletableFuture.completedFuture("skipped: no recipient specified");
        }

        List<UserDeviceToken> tokens;
        String cleanRecipient = recipientId.trim();

        if ("ALL".equalsIgnoreCase(cleanRecipient)) {
            tokens = tokenRepository.findByActiveTrue();
        } else if (cleanRecipient.toLowerCase().startsWith("ward_")) {
            String ward = cleanRecipient.substring(5);
            List<com.sgcs.entity.User> users = userRepository.findByWard(ward);
            List<String> userIds = users.stream().map(com.sgcs.entity.User::getId).toList();
            tokens = userIds.isEmpty() ? List.of() : tokenRepository.findByUserIdInAndActiveTrue(userIds);
        } else if (List.of("CITIZEN", "WORKER", "ADMIN", "COUNCILLOR", "COMMISSIONER").contains(cleanRecipient.toUpperCase())) {
            List<com.sgcs.entity.User> users = userRepository.findByRoleIgnoreCase(cleanRecipient);
            List<String> userIds = users.stream().map(com.sgcs.entity.User::getId).toList();
            tokens = userIds.isEmpty() ? List.of() : tokenRepository.findByUserIdInAndActiveTrue(userIds);
        } else {
            tokens = tokenRepository.findByUserIdAndActiveTrue(cleanRecipient);
        }

        if (tokens.isEmpty()) {
            logger.debug("No active FCM tokens found for recipient: {}", cleanRecipient);
            return CompletableFuture.completedFuture("skipped: no registered device");
        }

        String safeTitle = (title != null && !title.isEmpty()) ? title : "SGCS Notification";
        String safeBody = (body != null && !body.isEmpty()) ? body : "";
        if (safeBody.length() > 150) {
            safeBody = safeBody.substring(0, 147) + "...";
        }
        String safeType = (type != null && !type.isEmpty()) ? type : "GENERAL";
        String clickAction = (linkUrl != null && !linkUrl.isEmpty()) ? linkUrl : "/";

        int sent = 0;
        for (UserDeviceToken tokenEntity : tokens) {
            String fcmToken = tokenEntity.getFcmToken();
            try {
                Message message = Message.builder()
                        .setToken(fcmToken)
                        .setNotification(Notification.builder()
                                .setTitle(safeTitle)
                                .setBody(safeBody)
                                .build())
                        .putData("type", safeType)
                        .putData("title", safeTitle)
                        .putData("body", safeBody)
                        .putData("click_action", clickAction)
                        .setWebpushConfig(WebpushConfig.builder()
                                .putHeader("Urgency", "high")
                                .putHeader("TTL", "86400")
                                .setNotification(WebpushNotification.builder()
                                        .setTitle(safeTitle)
                                        .setBody(safeBody)
                                        .setIcon("/vite.svg")
                                        .build())
                                .build())
                        .build();

                String response = FirebaseMessaging.getInstance().send(message);
                logger.info("Successfully sent FCM notification to token for user {}, response: {}", tokenEntity.getUserId(), response);
                sent++;
            } catch (FirebaseMessagingException e) {
                logger.error("Firebase messaging error for user {}: {}", tokenEntity.getUserId(), e.getMessage());
                if (e.getMessagingErrorCode() != null) {
                    switch (e.getMessagingErrorCode()) {
                        case INVALID_ARGUMENT:
                        case UNREGISTERED:
                            logger.warn("Marking invalid/unregistered token as inactive: {}", tokenEntity.getId());
                            tokenEntity.setActive(false);
                            tokenRepository.save(tokenEntity);
                            break;
                        default:
                            break;
                    }
                }
            } catch (Exception e) {
                logger.error("Error sending FCM message: {}", e.getMessage());
            }
        }
        return CompletableFuture.completedFuture(sent > 0 ? "sent" : "failed");
    }
}
