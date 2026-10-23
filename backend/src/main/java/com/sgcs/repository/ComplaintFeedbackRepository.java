package com.sgcs.repository;

import com.sgcs.entity.ComplaintFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplaintFeedbackRepository extends JpaRepository<ComplaintFeedback, UUID> {
    Optional<ComplaintFeedback> findByComplaintId(String complaintId);
    Optional<ComplaintFeedback> findByComplaintIdAndCitizenId(String complaintId, String citizenId);
    boolean existsByComplaintIdAndCitizenId(String complaintId, String citizenId);
}
