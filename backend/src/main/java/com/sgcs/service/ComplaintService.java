package com.sgcs.service;

import com.sgcs.entity.Complaint;
import com.sgcs.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ComplaintService {

    private static final List<String> VALID_STATUSES = List.of("PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED");

    @Autowired
    private ComplaintRepository complaintRepository;

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Complaint> getComplaintById(String id) {
        return complaintRepository.findByIdOrTrackingNumber(id, id);
    }

    public List<Complaint> getComplaintsByCitizen(String citizenId) {
        return complaintRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
    }

    public List<Complaint> getComplaintsByWard(String ward) {
        return complaintRepository.findByWardOrderByCreatedAtDesc(ward);
    }

    public Complaint createComplaint(Complaint complaint) {
        if (complaint.getId() == null || complaint.getId().isEmpty()) {
            complaint.setId("cmp_" + System.currentTimeMillis());
        }
        if (complaint.getTrackingNumber() == null || complaint.getTrackingNumber().isEmpty()) {
            complaint.setTrackingNumber("TRK-" + (100000 + (int)(Math.random() * 900000)));
        }

        if (complaint.getStatus() == null) {
            complaint.setStatus("PENDING");
        }

        if (complaint.getPriority() == null || complaint.getPriority().isEmpty()) {
            complaint.setPriority("MEDIUM");
        }

        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());

        return complaintRepository.save(complaint);
    }

    public Complaint updateStatus(String id, String status) {
        if (status == null || !VALID_STATUSES.contains(status.toUpperCase().trim())) {
            throw new IllegalArgumentException("Invalid status value. Allowed status values are PENDING, IN_PROGRESS, RESOLVED, REJECTED.");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        complaint.setStatus(status.toUpperCase().trim());
        complaint.setUpdatedAt(LocalDateTime.now());
        return complaintRepository.save(complaint);
    }

    public Complaint assignWorker(String id, Map<String, String> body) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        
        complaint.setAssignedWorkerId(body.get("workerId"));
        complaint.setAssignedWorkerName(body.get("workerName"));
        complaint.setStatus("IN_PROGRESS");
        complaint.setUpdatedAt(LocalDateTime.now());

        return complaintRepository.save(complaint);
    }

    public void deleteAllComplaints() {
        complaintRepository.deleteAll();
    }
}
