package com.sgcs.repository;

import com.sgcs.entity.UserDeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDeviceTokenRepository extends JpaRepository<UserDeviceToken, String> {
    Optional<UserDeviceToken> findByFcmToken(String fcmToken);
    List<UserDeviceToken> findByUserIdAndActiveTrue(String userId);
    List<UserDeviceToken> findByUserId(String userId);
    List<UserDeviceToken> findByActiveTrue();
    List<UserDeviceToken> findByUserIdInAndActiveTrue(List<String> userIds);
}
