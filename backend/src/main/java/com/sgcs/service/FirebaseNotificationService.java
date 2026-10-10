package com.sgcs.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.WebpushConfig;
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

    @Async
    public CompletableFuture<String> sendUrgentTaskPushNotification(String workerId, String taskId, String trackingNumber, String complaintTitle, String ward, String location) {
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
                        .putData("type", "URGENT_TASK")
                        .putData("taskId", taskId)
                        .putData("trackingNumber", trackingNumber)
                        .putData("title", "Urgent task assigned")
                        .putData("body", body)
                        .putData("click_action", "/worker/tasks")
                        .setWebpushConfig(WebpushConfig.builder()
                                .putHeader("Urgency", "high")
                                .putHeader("TTL", "3600")
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
        List<UserDeviceToken> tokens = tokenRepository.findByUserIdAndActiveTrue(oldWorkerId);
        if (tokens.isEmpty()) return;

        String body = "Urgent work order #" + trackingNumber + " (" + complaintTitle + ") has been transferred away from your queue.";
        if (body.length() > 120) body = body.substring(0, 117) + "...";

        for (UserDeviceToken tokenEntity : tokens) {
            String fcmToken = tokenEntity.getFcmToken();
            try {
                Message message = Message.builder()
                        .setToken(fcmToken)
                        .putData("type", "TASK_TRANSFERRED")
                        .putData("title", "Task Transferred")
                        .putData("body", body)
                        .setWebpushConfig(WebpushConfig.builder()
                                .putHeader("Urgency", "high")
                                .putHeader("TTL", "3600")
                                .build())
                        .build();

                FirebaseMessaging.getInstance().send(message);
            } catch (Exception e) {
                logger.error("Error sending transfer FCM: {}", e.getMessage());
            }
        }
    }
}
