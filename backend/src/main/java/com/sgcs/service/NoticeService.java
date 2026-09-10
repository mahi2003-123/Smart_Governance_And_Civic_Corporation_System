package com.sgcs.service;

import com.sgcs.entity.Notice;
import com.sgcs.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private AuditService auditService;

    public List<Notice> getAllNotices() {
        return noticeRepository.findAllByOrderByPublishDateDesc();
    }

    public List<Notice> getNoticesByWard(String ward) {
        return noticeRepository.findByWardOrderByPublishDateDesc(ward);
    }

    @Autowired
    private NotificationService notificationService;

    public Notice createNotice(Notice notice) {
        if (notice.getId() == null || notice.getId().isEmpty()) {
            notice.setId("notif_" + System.currentTimeMillis());
        }
        notice.setPublishDate(LocalDateTime.now());
        Notice saved = noticeRepository.save(notice);

        auditService.logActivity(
            saved.getPublishedBy() != null ? saved.getPublishedBy() : "usr_councillor",
            saved.getPublishedBy() != null ? saved.getPublishedBy() : "Councillor",
            "COUNCILLOR",
            "Published Civic Notice",
            "NOTICE",
            saved.getId(),
            "Published announcement: \"" + saved.getTitle() + "\" for " + saved.getWard()
        );

        try {
            String title = "📢 " + ("EMERGENCY".equalsIgnoreCase(saved.getPriority()) ? "EMERGENCY ALERT" : "Official Ward Notice") + ": " + saved.getTitle();
            String msg = "Published by " + (saved.getPublishedBy() != null ? saved.getPublishedBy() : "Ward Councillor") + " (" + saved.getWard() + "): " + (saved.getContent() != null && saved.getContent().length() > 100 ? saved.getContent().substring(0, 100) + "..." : saved.getContent());
            notificationService.createNotification(
                "ALL",
                title,
                msg,
                "NOTICE",
                "/citizen/notices"
            );
        } catch (Exception e) {
            System.err.println("Failed to create notice notification: " + e.getMessage());
        }

        return saved;
    }
}
