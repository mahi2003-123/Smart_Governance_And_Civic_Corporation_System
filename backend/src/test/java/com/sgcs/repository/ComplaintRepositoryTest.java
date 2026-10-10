package com.sgcs.repository;

import com.sgcs.entity.Complaint;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional // Rolls back the database automatically so testing doesn't leave data behind!
public class ComplaintRepositoryTest {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Test
    public void testSaveAndRetrieveComplaint() {
        // Arrange
        Complaint complaint = new Complaint();
        complaint.setId("cmp_test_999");
        complaint.setTrackingNumber("TRK-TEST");
        complaint.setCitizenId("usr_cit_1");
        complaint.setTitle("Test Title");
        complaint.setCategory("Other");
        complaint.setPriority("MEDIUM");
        complaint.setDescription("Water flooding");
        complaint.setLocationAddress("Test Address 123");
        complaint.setCitizenName("Test Citizen");
        complaint.setCitizenPhone("0987654321");
        complaint.setWard("Ward 1");
        complaint.setStatus("PENDING");
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());

        // Act
        Complaint saved = complaintRepository.save(complaint);

        // Assert
        assertNotNull(saved.getId(), "Complaint should be persisted with an ID");
        Optional<Complaint> retrieved = complaintRepository.findById(saved.getId());
        assertTrue(retrieved.isPresent(), "Complaint should be reachable through Postgres");
        assertEquals("Ward 1", retrieved.get().getWard(), "Ward data should persist identically");
    }

    @Test
    public void testFindByWard() {
        // Arrange
        Complaint complaint = new Complaint();
        complaint.setId("cmp_test_888");
        complaint.setTrackingNumber("TRK-WARD");
        complaint.setTitle("Test Title Find By Ward");
        complaint.setCategory("ROAD");
        complaint.setPriority("MEDIUM");
        complaint.setDescription("E2E Description");
        complaint.setLocationAddress("E2E Location Address");
        complaint.setCitizenId("usr_cit_2");
        complaint.setCitizenName("E2E Citizen");
        complaint.setCitizenPhone("1234567890");
        complaint.setWard("Ward E2E");
        complaint.setStatus("PENDING");
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());
        complaintRepository.save(complaint);

        // Act
        List<Complaint> wardComplaints = complaintRepository.findByWardOrderByCreatedAtDesc("Ward E2E");

        // Assert
        assertFalse(wardComplaints.isEmpty(), "Should find complaints assigned specifically to this Ward");
        assertEquals("Ward E2E", wardComplaints.get(0).getWard());
    }
}
