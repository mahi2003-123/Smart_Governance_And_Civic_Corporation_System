package com.sgcs.repository;

import com.sgcs.entity.ComplaintAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintAttachmentRepository extends JpaRepository<ComplaintAttachment, UUID> {
    List<ComplaintAttachment> findByComplaintId(String complaintId);
    List<ComplaintAttachment> findByComplaintIdAndKind(String complaintId, String kind);
}
