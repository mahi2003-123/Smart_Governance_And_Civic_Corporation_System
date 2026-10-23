package com.sgcs.controller;

import com.sgcs.entity.Notification;
import com.sgcs.exception.ResourceNotFoundException;
import com.sgcs.repository.NotificationRepository;
import com.sgcs.security.AccessGuard;
import com.sgcs.security.UserPrincipal;
import com.sgcs.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AccessGuard accessGuard;

    private UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Notification> list = notificationService.getNotificationsForUser(user.getId(), user.getRole(), user.getWard());
        return ResponseEntity.ok(list);
    }

    // Rule C: Removed public POST /api/notifications (notifications are created only by server code)

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        // Rule C: markAsRead only if the notification belongs to the caller (recipient id equals user id, or ward_<theirWard>, or ALL)
        accessGuard.checkCanMarkNotificationRead(user, notification);

        Notification updated = notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        notificationService.markAllAsReadForUser(user.getId(), user.getRole(), user.getWard());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @PostMapping("/device-token")
    public ResponseEntity<Map<String, String>> registerDeviceToken(@RequestBody Map<String, String> body) {
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String token = body.get("fcmToken");
        String deviceType = body.get("deviceType");
        String deviceName = body.get("deviceName");
        
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "fcmToken is required"));
        }
        
        notificationService.registerDeviceToken(user.getId(), token.trim(), deviceType, deviceName);
        return ResponseEntity.ok(Map.of("message", "Device token registered successfully"));
    }
}
