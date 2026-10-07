package com.sgcs.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.sgcs.entity.UserDeviceToken;
import com.sgcs.repository.UserDeviceTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FirebaseNotificationService {

    @Autowired
    private UserDeviceTokenRepository tokenRepository;

    public void sendUrgentTaskPushNotification(String workerId, String taskId, String complaintTitle, String ward, String location) {
        List<UserDeviceToken> tokens = tokenRepository.findByUserIdAndActiveTrue(workerId);
        
        if (tokens.isEmpty()) {
            System.out.println("No active FCM tokens found for workerId: " + workerId);
            return;
        }

        String title = "🚨 SGCS Urgent Task";
        String body = "You have been assigned an urgent civic task.\nTask: " + complaintTitle;
        if (location != null && !location.isEmpty()) {
            body += "\nLocation: " + location;
        } else if (ward != null && !ward.isEmpty()) {
            body += "\nWard: " + ward;
        }

        for (UserDeviceToken tokenEntity : tokens) {
            String fcmToken = tokenEntity.getFcmToken();
            try {
                Message message = Message.builder()
                        .setToken(fcmToken)
                        .setNotification(Notification.builder()
                                .setTitle(title)
                                .setBody(body)
                                .build())
                        .putData("taskId", taskId)
                        .putData("priority", "URGENT")
                        .putData("type", "URGENT_TASK")
                        .putData("click_action", "/worker/assigned")
                        .build();

                String response = FirebaseMessaging.getInstance().send(message);
                System.out.println("Successfully sent message to token: " + fcmToken + ", response: " + response);
            } catch (FirebaseMessagingException e) {
                System.err.println("Firebase messaging error for token " + fcmToken + ": " + e.getMessage());
                // Handle invalid tokens
                if (e.getMessagingErrorCode() != null) {
                    switch (e.getMessagingErrorCode()) {
                        case INVALID_ARGUMENT:
                        case UNREGISTERED:
                            System.out.println("Marking token " + fcmToken + " as inactive.");
                            tokenEntity.setActive(false);
                            tokenRepository.save(tokenEntity);
                            break;
                        default:
                            break;
                    }
                }
            } catch (Exception e) {
                System.err.println("Error sending FCM message: " + e.getMessage());
            }
        }
    }

    public void sendTaskTransferredPushNotification(String oldWorkerId, String trackingNumber, String complaintTitle) {
        List<UserDeviceToken> tokens = tokenRepository.findByUserIdAndActiveTrue(oldWorkerId);
        if (tokens.isEmpty()) return;

        String title = "🚨 Task Transferred";
        String body = "Urgent work order #" + trackingNumber + " (" + complaintTitle + ") has been transferred away from your queue.";

        for (UserDeviceToken tokenEntity : tokens) {
            String fcmToken = tokenEntity.getFcmToken();
            try {
                Message message = Message.builder()
                        .setToken(fcmToken)
                        .setNotification(Notification.builder()
                                .setTitle(title)
                                .setBody(body)
                                .build())
                        .putData("type", "TASK_TRANSFERRED")
                        .build();

                FirebaseMessaging.getInstance().send(message);
            } catch (Exception e) {
                System.err.println("Error sending transfer FCM: " + e.getMessage());
            }
        }
    }
}
