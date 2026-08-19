package com.sgcs.repository;

import com.sgcs.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findByCitizenIdOrderByCreatedAtDesc(String citizenId);
    List<Complaint> findByWardOrderByCreatedAtDesc(String ward);
    List<Complaint> findByAssignedWorkerIdOrderByCreatedAtDesc(String assignedWorkerId);
    List<Complaint> findByStatus(String status);
    
    @Query("SELECT c.category as category, COUNT(c) as count FROM Complaint c GROUP BY c.category")
    List<Object[]> countByCategory();
    
    Long countByStatus(String status);
}
