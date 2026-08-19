package com.sgcs.controller;

import com.sgcs.entity.Notice;
import com.sgcs.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @GetMapping
    public ResponseEntity<List<Notice>> getAllNotices(@RequestParam(required = false) String ward) {
        if (ward != null && !ward.isEmpty()) {
            return ResponseEntity.ok(noticeService.getNoticesByWard(ward));
        }
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    @PostMapping
    public ResponseEntity<?> createNotice(@RequestBody Notice notice) {
        try {
            Notice created = noticeService.createNotice(notice);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
