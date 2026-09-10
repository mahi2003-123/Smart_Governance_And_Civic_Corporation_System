package com.sgcs.service;

import com.sgcs.entity.SystemActivity;
import com.sgcs.repository.SystemActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    @Autowired
    private SystemActivityRepository activityRepository;

    public void logActivity(String userId, String userName, String userRole, String action, String module, String reference, String details) {
        try {
            String id = "act_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
            SystemActivity activity = new SystemActivity(
                id,
                userId != null ? userId : "system",
                userName != null ? userName : "System",
                userRole != null ? userRole : "SYSTEM",
                action,
                module,
                reference,
                details
            );
            activityRepository.save(activity);
        } catch (Exception e) {
            System.err.println("[AuditService] Failed to log activity: " + e.getMessage());
        }
    }

    public List<SystemActivity> getAllActivities() {
        return activityRepository.findAllByOrderByCreatedAtDesc();
    }
}
