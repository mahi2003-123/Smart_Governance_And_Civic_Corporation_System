package com.sgcs.repository;

import com.sgcs.entity.NotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationReadRepository extends JpaRepository<NotificationRead, NotificationRead.NotificationReadId> {
    boolean existsByIdNotificationIdAndIdUserId(String notificationId, String userId);
    List<NotificationRead> findByIdUserId(String userId);
}
