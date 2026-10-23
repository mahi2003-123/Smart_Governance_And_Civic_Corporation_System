package com.sgcs.repository;

import com.sgcs.entity.Complaint;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    Optional<Complaint> findByIdOrTrackingNumber(String id, String trackingNumber);
    Optional<Complaint> findByTrackingNumber(String trackingNumber);
    boolean existsByTrackingNumber(String trackingNumber);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findByCitizenIdOrderByCreatedAtDesc(String citizenId);
    List<Complaint> findByWardOrderByCreatedAtDesc(String ward);
    List<Complaint> findByAssignedWorkerIdOrderByCreatedAtDesc(String assignedWorkerId);
    List<Complaint> findByStatus(String status);
    
    @Query("SELECT c.category as category, COUNT(c) as count FROM Complaint c GROUP BY c.category")
    List<Object[]> countByCategory();
    
    Long countByStatus(String status);

    @Query(value = "SELECT nextval('tracking_seq')", nativeQuery = true)
    Long getNextTrackingSequence();

    @Query("SELECT c FROM Complaint c WHERE c.status IS NOT NULL AND UPPER(c.status) IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS') ORDER BY c.createdAt DESC")
    List<Complaint> findActiveComplaints();

    @Query("SELECT c FROM Complaint c WHERE c.ward = :ward AND c.status IS NOT NULL AND UPPER(c.status) IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS') AND c.createdAt >= :since ORDER BY c.createdAt DESC")
    List<Complaint> findRecentActiveComplaintsByWard(
        @Param("ward") String ward,
        @Param("since") LocalDateTime since,
        Pageable pageable
    );
}
