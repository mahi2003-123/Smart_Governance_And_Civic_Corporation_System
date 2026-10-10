package com.sgcs.repository;

import com.sgcs.entity.Complaint;
import com.sgcs.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class DatabaseEndToEndTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Test
    public void testFullDatabaseEndToEndLifecycle() {
        // -------------------------------------------------------------
        // PHASE 1: USER REGISTRATION (CITIZEN & WORKER)
        // -------------------------------------------------------------
        
        // 1a. Create Citizen
        User citizen = new User();
        citizen.setId("usr_cit_e2e_1");
        citizen.setFullName("End To End Citizen");
        citizen.setEmail("e2e_citizen@sgcs.com");
        citizen.setPassword("encoded_secret");
        citizen.setPhone("9988776655");
        citizen.setRole("CITIZEN");
        citizen.setWard("Ward E2E");
        
        userRepository.save(citizen);
        
        // 1b. Create Worker
        User worker = new User();
        worker.setId("usr_wrk_e2e_1");
        worker.setFullName("End To End Worker");
        worker.setEmail("e2e_worker@sgcs.com");
        worker.setPassword("encoded_secret");
        worker.setPhone("1122334455");
        worker.setRole("WORKER");
        worker.setWard("Ward E2E");
        worker.setSpecialization("ROAD");
        
        userRepository.save(worker);
        
        // Verify User Persistence
        assertTrue(userRepository.findById("usr_cit_e2e_1").isPresent(), "Citizen should be created");
        assertTrue(userRepository.findById("usr_wrk_e2e_1").isPresent(), "Worker should be created");
        
        
        // -------------------------------------------------------------
        // PHASE 2: CITIZEN SUBMITS COMPLAINT
        // -------------------------------------------------------------
        Complaint complaint = new Complaint();
        complaint.setId("cmp_e2e_999");
        complaint.setTrackingNumber("TRK-E2E-TEST");
        complaint.setCitizenId("usr_cit_e2e_1");
        complaint.setCitizenName("End To End Citizen");
        complaint.setCitizenPhone("9988776655");
        complaint.setTitle("Massive Pothole Database E2E");
        complaint.setCategory("ROAD");
        complaint.setPriority("HIGH");
        complaint.setDescription("There is a massive pothole that needs immediate attention.");
        complaint.setLocationAddress("E2E Test Location Route 66");
        complaint.setWard("Ward E2E");
        complaint.setStatus("PENDING");
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());
        
        complaintRepository.save(complaint);
        
        // Verify DB retrieved it successfully
        Complaint savedComplaint = complaintRepository.findById("cmp_e2e_999").orElse(null);
        assertNotNull(savedComplaint, "Complaint should be persisted");
        assertEquals("PENDING", savedComplaint.getStatus(), "Initial Status must be PENDING");
        
        
        // -------------------------------------------------------------
        // PHASE 3: AI CATEGORIZATION & DUPLICATE SIMULATION UPDATE
        // -------------------------------------------------------------
        savedComplaint.setAiSuggestedCategory("ROAD");
        savedComplaint.setAiConfidence(0.98);
        savedComplaint.setPossibleDuplicateId(null);
        savedComplaint.setIsDuplicateConfirmed(false);
        complaintRepository.save(savedComplaint);
        
        // -------------------------------------------------------------
        // PHASE 4: COUNCILLOR ASSIGNS WORKER
        // -------------------------------------------------------------
        savedComplaint.setAssignedWorkerId(worker.getId());
        savedComplaint.setAssignedWorkerName(worker.getFullName());
        savedComplaint.setStatus("IN_PROGRESS");
        savedComplaint.setPriority("URGENT");
        complaintRepository.save(savedComplaint);
        
        // Read Back
        List<Complaint> workerTasks = complaintRepository.findByAssignedWorkerIdOrderByCreatedAtDesc("usr_wrk_e2e_1");
        assertEquals(1, workerTasks.size(), "Worker should have exactly 1 assigned task");
        assertEquals("URGENT", workerTasks.get(0).getPriority(), "Task priority updated by Councillor");
        
        
        // -------------------------------------------------------------
        // PHASE 5: WORKER RESOLVES COMPLAINT
        // -------------------------------------------------------------
        Complaint activeTask = workerTasks.get(0);
        activeTask.setWorkerNotes("Pothole patched with fresh asphalt.");
        activeTask.setCompletionImage("b64_image_data_mock");
        activeTask.setStatus("RESOLVED");
        complaintRepository.save(activeTask);
        
        
        // -------------------------------------------------------------
        // PHASE 6: E2E FINAL VERIFICATION
        // -------------------------------------------------------------
        Complaint finalValidation = complaintRepository.findById("cmp_e2e_999").orElse(null);
        assertNotNull(finalValidation);
        assertEquals("RESOLVED", finalValidation.getStatus(), "End state should be heavily persisted as RESOLVED");
        assertEquals("Pothole patched with fresh asphalt.", finalValidation.getWorkerNotes());
        assertEquals("ROAD", finalValidation.getAiSuggestedCategory(), "AI data should survive state transitions");
        assertEquals("usr_wrk_e2e_1", finalValidation.getAssignedWorkerId());
    }
}
