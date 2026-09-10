package com.sgcs.repository;

import com.sgcs.entity.SystemActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemActivityRepository extends JpaRepository<SystemActivity, String> {
    List<SystemActivity> findAllByOrderByCreatedAtDesc();
    List<SystemActivity> findByModuleOrderByCreatedAtDesc(String module);
    List<SystemActivity> findByUserRoleOrderByCreatedAtDesc(String userRole);
}
