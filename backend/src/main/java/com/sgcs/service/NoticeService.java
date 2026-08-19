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

    public List<Notice> getAllNotices() {
        return noticeRepository.findAllByOrderByPublishDateDesc();
    }

    public List<Notice> getNoticesByWard(String ward) {
        return noticeRepository.findByWardOrderByPublishDateDesc(ward);
    }

    public Notice createNotice(Notice notice) {
        if (notice.getId() == null || notice.getId().isEmpty()) {
            notice.setId("notif_" + System.currentTimeMillis());
        }
        notice.setPublishDate(LocalDateTime.now());
        return noticeRepository.save(notice);
    }
}
