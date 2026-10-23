package com.sgcs.controller;

import com.sgcs.entity.Notice;
import com.sgcs.exception.ResourceNotFoundException;
import com.sgcs.repository.NoticeRepository;
import com.sgcs.security.AccessGuard;
import com.sgcs.security.UserPrincipal;
import com.sgcs.service.NoticeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @Autowired
    private NoticeRepository noticeRepository;

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
    public ResponseEntity<List<Notice>> getAllNotices(@RequestParam(required = false) String ward) {
        if (ward != null && !ward.isEmpty()) {
            return ResponseEntity.ok(noticeService.getNoticesByWard(ward));
        }
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    @PostMapping
    public ResponseEntity<Notice> createNotice(@Valid @RequestBody Notice notice) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Rule D: only COUNCILLOR (their own ward or "system wide" ONLY if ADMIN) and ADMIN may create. Enforce ward server-side.
        accessGuard.checkCanCreateNotice(principal, notice.getWard());

        if (notice.getPublishedBy() == null || notice.getPublishedBy().isEmpty()) {
            notice.setPublishedBy(principal.getFullName());
        }
        Notice created = noticeService.createNotice(notice);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable String id) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found with id: " + id));

        // Rule D: only COUNCILLOR (their own ward) and ADMIN may delete.
        accessGuard.checkCanDeleteNotice(principal, notice);

        noticeService.deleteNotice(id);
        return ResponseEntity.ok(Map.of("message", "Notice deleted successfully", "id", id));
    }
}
