package com.sgcs.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sgcs.dto.CreateComplaintRequest;
import com.sgcs.dto.CreateProposalRequest;
import com.sgcs.entity.Complaint;
import com.sgcs.entity.Proposal;
import com.sgcs.entity.User;
import com.sgcs.entity.Ward;
import com.sgcs.repository.ComplaintRepository;
import com.sgcs.repository.ProposalRepository;
import com.sgcs.repository.UserRepository;
import com.sgcs.repository.WardRepository;
import com.sgcs.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AuthorizationSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WardRepository wardRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User citizenA;
    private User citizenB;
    private User councillorWard1;
    private User councillorWard2;
    private User workerA;
    private User workerB;
    private User admin;

    private String citizenAToken;
    private String citizenBToken;
    private String councillorWard1Token;
    private String councillorWard2Token;
    private String workerAToken;
    private String workerBToken;
    private String adminToken;

    private Complaint complaintWard1WorkerA;
    private Complaint complaintWard2;
    private Proposal proposalWard1;

    @BeforeEach
    public void setUp() {
        wardRepository.save(new Ward("w1", 1, "Ward 1 - Central Town", "Councillor Ward 1", "cw1@example.com", 45000));
        wardRepository.save(new Ward("w2", 2, "Ward 2 - Riverside North", "Councillor Ward 2", "cw2@example.com", 32000));

        // Create test users
        citizenA = new User("citizen-a-id", "Citizen Alice", "alice@example.com", passwordEncoder.encode("Password123!"), "9998887771", "CITIZEN", "Ward 1");
        citizenA.setStatus("ACTIVE");
        userRepository.save(citizenA);

        citizenB = new User("citizen-b-id", "Citizen Bob", "bob@example.com", passwordEncoder.encode("Password123!"), "9998887772", "CITIZEN", "Ward 2");
        citizenB.setStatus("ACTIVE");
        userRepository.save(citizenB);

        councillorWard1 = new User("councillor-w1-id", "Councillor Ward 1", "cw1@example.com", passwordEncoder.encode("Password123!"), "9998887773", "COUNCILLOR", "Ward 1");
        councillorWard1.setStatus("ACTIVE");
        userRepository.save(councillorWard1);

        councillorWard2 = new User("councillor-w2-id", "Councillor Ward 2", "cw2@example.com", passwordEncoder.encode("Password123!"), "9998887774", "COUNCILLOR", "Ward 2");
        councillorWard2.setStatus("ACTIVE");
        userRepository.save(councillorWard2);

        workerA = new User("worker-a-id", "Worker Adam", "adam@example.com", passwordEncoder.encode("Password123!"), "9998887775", "WORKER", "Ward 1");
        workerA.setStatus("ACTIVE");
        workerA.setSpecialization("Sanitation");
        userRepository.save(workerA);

        workerB = new User("worker-b-id", "Worker Ben", "ben@example.com", passwordEncoder.encode("Password123!"), "9998887776", "WORKER", "Ward 1");
        workerB.setStatus("ACTIVE");
        workerB.setSpecialization("Roads");
        userRepository.save(workerB);

        admin = new User("admin-id", "Admin Boss", "admin@example.com", passwordEncoder.encode("Password123!"), "9998887777", "ADMIN", "HQ");
        admin.setStatus("ACTIVE");
        userRepository.save(admin);

        // Generate Bearer tokens
        citizenAToken = "Bearer " + jwtUtils.generateToken(citizenA);
        citizenBToken = "Bearer " + jwtUtils.generateToken(citizenB);
        councillorWard1Token = "Bearer " + jwtUtils.generateToken(councillorWard1);
        councillorWard2Token = "Bearer " + jwtUtils.generateToken(councillorWard2);
        workerAToken = "Bearer " + jwtUtils.generateToken(workerA);
        workerBToken = "Bearer " + jwtUtils.generateToken(workerB);
        adminToken = "Bearer " + jwtUtils.generateToken(admin);

        // Create initial complaint in Ward 1 assigned to Worker A
        complaintWard1WorkerA = new Complaint();
        complaintWard1WorkerA.setId("comp-w1-wa");
        complaintWard1WorkerA.setTrackingNumber("SGCS-2026-1111");
        complaintWard1WorkerA.setTitle("Pothole on Main St");
        complaintWard1WorkerA.setDescription("Deep pothole causing traffic issues");
        complaintWard1WorkerA.setCategory("ROADS");
        complaintWard1WorkerA.setWard("Ward 1");
        complaintWard1WorkerA.setLocationAddress("Main Street, Ward 1");
        complaintWard1WorkerA.setStatus("ASSIGNED");
        complaintWard1WorkerA.setPriority("MEDIUM");
        complaintWard1WorkerA.setCitizenId(citizenA.getId());
        complaintWard1WorkerA.setCitizenName(citizenA.getFullName());
        complaintWard1WorkerA.setCitizenPhone(citizenA.getPhone());
        complaintWard1WorkerA.setAssignedWorkerId(workerA.getId());
        complaintWard1WorkerA.setAssignedWorkerName(workerA.getFullName());
        complaintRepository.save(complaintWard1WorkerA);

        // Create complaint in Ward 2
        complaintWard2 = new Complaint();
        complaintWard2.setId("comp-w2");
        complaintWard2.setTrackingNumber("SGCS-2026-2222");
        complaintWard2.setTitle("Streetlight broken");
        complaintWard2.setDescription("Streetlight flickering at night");
        complaintWard2.setCategory("LIGHTING");
        complaintWard2.setWard("Ward 2");
        complaintWard2.setLocationAddress("Oak Avenue, Ward 2");
        complaintWard2.setStatus("PENDING");
        complaintWard2.setPriority("LOW");
        complaintWard2.setCitizenId(citizenB.getId());
        complaintWard2.setCitizenName(citizenB.getFullName());
        complaintWard2.setCitizenPhone(citizenB.getPhone());
        complaintRepository.save(complaintWard2);

        // Create proposal in Ward 1
        proposalWard1 = new Proposal();
        proposalWard1.setId("prop-w1");
        proposalWard1.setTitle("Park Bench Upgrade");
        proposalWard1.setDescription("Install 5 new benches");
        proposalWard1.setCategory("INFRASTRUCTURE");
        proposalWard1.setWard("Ward 1");
        proposalWard1.setAuthorName(citizenA.getFullName());
        proposalWard1.setAuthorRole("CITIZEN");
        proposalWard1.setStatus("PENDING");
        proposalRepository.save(proposalWard1);
    }

    @Test
    @DisplayName("Criterion 1: Citizen gets 403 on approve, reject-proof, start, complete, delay, assign, ai-category, link-duplicate, proposal review, notice create, creating a notification")
    public void testCitizenGets403OnRestrictedEndpoints() throws Exception {
        String compId = complaintWard1WorkerA.getId();

        // 1. approve
        mockMvc.perform(patch("/api/complaints/" + compId + "/approve")
                .header("Authorization", citizenAToken))
                .andExpect(status().isForbidden());

        // 2. reject-proof
        Map<String, String> rejectPayload = Map.of("rejectionReason", "Incomplete work");
        mockMvc.perform(patch("/api/complaints/" + compId + "/reject-proof")
                .header("Authorization", citizenAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rejectPayload)))
                .andExpect(status().isForbidden());

        // 3. start
        mockMvc.perform(patch("/api/complaints/" + compId + "/start")
                .header("Authorization", citizenAToken))
                .andExpect(status().isForbidden());

        // 4. complete
        Map<String, String> completePayload = Map.of("completionImage", "http://img.com/a.jpg", "notes", "done");
        mockMvc.perform(patch("/api/complaints/" + compId + "/complete")
                .header("Authorization", citizenAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completePayload)))
                .andExpect(status().isForbidden());

        // 5. delay
        Map<String, String> delayPayload = Map.of("delayReason", "Rain", "notes", "Wet weather");
        mockMvc.perform(patch("/api/complaints/" + compId + "/delay")
                .header("Authorization", citizenAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(delayPayload)))
                .andExpect(status().isForbidden());

        // 6. assign
        Map<String, String> assignPayload = Map.of("workerId", workerA.getId(), "workerName", workerA.getFullName());
        mockMvc.perform(patch("/api/complaints/" + compId + "/assign")
                .header("Authorization", citizenAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignPayload)))
                .andExpect(status().isForbidden());

        // 7. ai-category
        Map<String, Object> aiPayload = Map.of("accepted", true);
        mockMvc.perform(patch("/api/complaints/" + compId + "/ai-category")
                .header("Authorization", citizenAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(aiPayload)))
                .andExpect(status().isForbidden());

        // 8. link-duplicate
        Map<String, Object> dupPayload = Map.of("confirmed", true);
        mockMvc.perform(patch("/api/complaints/" + compId + "/link-duplicate")
                .header("Authorization", citizenAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dupPayload)))
                .andExpect(status().isForbidden());

        // 9. proposal review
        Map<String, String> reviewPayload = Map.of("status", "APPROVED", "notes", "Looks great");
        mockMvc.perform(patch("/api/proposals/" + proposalWard1.getId() + "/review")
                .header("Authorization", citizenAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reviewPayload)))
                .andExpect(status().isForbidden());

        // 10. notice create
        Map<String, String> noticePayload = Map.of("title", "Notice", "content", "Test notice", "ward", "Ward 1", "priority", "MEDIUM");
        mockMvc.perform(post("/api/notices")
                .header("Authorization", citizenAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(noticePayload)))
                .andExpect(status().isForbidden());

        // 11. creating a notification (client creation denied)
        Map<String, String> notifPayload = Map.of("title", "Alert", "message", "Test alert", "recipientId", "ALL", "ward", "Ward 1");
        mockMvc.perform(post("/api/notifications")
                .header("Authorization", citizenAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notifPayload)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Criterion 2: Councillor of Ward A gets 403 on Ward B's complaint (read, assign, approve, comment)")
    public void testCouncillorCrossWardGets403() throws Exception {
        String compWard2Id = complaintWard2.getId();

        // 1. read Ward 2 complaint with Councillor of Ward 1
        mockMvc.perform(get("/api/complaints/" + compWard2Id)
                .header("Authorization", councillorWard1Token))
                .andExpect(status().isForbidden());

        // 2. assign Ward 2 complaint with Councillor of Ward 1
        Map<String, String> assignPayload = Map.of("workerId", workerA.getId(), "workerName", workerA.getFullName());
        mockMvc.perform(patch("/api/complaints/" + compWard2Id + "/assign")
                .header("Authorization", councillorWard1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignPayload)))
                .andExpect(status().isForbidden());

        // 3. approve Ward 2 complaint with Councillor of Ward 1
        mockMvc.perform(patch("/api/complaints/" + compWard2Id + "/approve")
                .header("Authorization", councillorWard1Token))
                .andExpect(status().isForbidden());

        // 4. comment on Ward 2 complaint with Councillor of Ward 1
        Map<String, String> commentPayload = Map.of("content", "Unauthorized councillor comment");
        mockMvc.perform(post("/api/complaints/" + compWard2Id + "/comments")
                .header("Authorization", councillorWard1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentPayload)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Criterion 3: Worker B gets 403 on Worker A's task")
    public void testWorkerBOnWorkerATaskGets403() throws Exception {
        String taskCompId = complaintWard1WorkerA.getId(); // Assigned to Worker A

        // Worker B tries to start task assigned to Worker A
        mockMvc.perform(patch("/api/complaints/" + taskCompId + "/start")
                .header("Authorization", workerBToken))
                .andExpect(status().isForbidden());

        // Worker B tries to complete task assigned to Worker A
        Map<String, String> completePayload = Map.of("completionImage", "http://img.com/b.jpg", "notes", "Worker B finished it");
        mockMvc.perform(patch("/api/complaints/" + taskCompId + "/complete")
                .header("Authorization", workerBToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completePayload)))
                .andExpect(status().isForbidden());

        // Worker B tries to delay task assigned to Worker A
        Map<String, String> delayPayload = Map.of("delayReason", "Tools missing", "notes", "Cannot proceed");
        mockMvc.perform(patch("/api/complaints/" + taskCompId + "/delay")
                .header("Authorization", workerBToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(delayPayload)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Criterion 4: POST /api/complaints with an existing id or status=RESOLVED cannot overwrite or pre-resolve anything")
    public void testPostComplaintCannotOverwriteOrPreResolve() throws Exception {
        String existingId = complaintWard1WorkerA.getId();

        // Attempt to pass malicious fields: existing ID, pre-resolved status, escalated priority
        Map<String, Object> maliciousRequest = new HashMap<>();
        maliciousRequest.put("id", existingId);
        maliciousRequest.put("status", "RESOLVED");
        maliciousRequest.put("priority", "URGENT");
        maliciousRequest.put("title", "Overwritten Title");
        maliciousRequest.put("description", "Malicious complaint payload");
        maliciousRequest.put("category", "ROADS");
        maliciousRequest.put("ward", "Ward 1");
        maliciousRequest.put("locationAddress", "123 Test Road");

        mockMvc.perform(post("/api/complaints")
                .header("Authorization", citizenAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(maliciousRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(org.hamcrest.Matchers.not(existingId)))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.priority").value("MEDIUM")) // Priority capped from URGENT to MEDIUM for citizen
                .andExpect(jsonPath("$.citizenId").value(citizenA.getId()))
                .andExpect(jsonPath("$.citizenName").value(citizenA.getFullName()));

        // Verify the original complaint was completely untouched in the database
        Complaint untouched = complaintRepository.findById(existingId).orElseThrow();
        assertThat(untouched.getTitle()).isEqualTo("Pothole on Main St");
        assertThat(untouched.getStatus()).isEqualTo("ASSIGNED");
    }

    @Test
    @DisplayName("Criterion 5: A comment sent with authorRole=COUNCILLOR is stored with the caller's real role")
    public void testCommentAuthorRoleSpoofingIgnored() throws Exception {
        String compId = complaintWard1WorkerA.getId();

        // Citizen sends a comment claiming to be COUNCILLOR
        Map<String, String> spoofedComment = new HashMap<>();
        spoofedComment.put("content", "Citizen posing as Councillor");
        spoofedComment.put("authorRole", "COUNCILLOR");
        spoofedComment.put("authorName", "Fake Boss");

        mockMvc.perform(post("/api/complaints/" + compId + "/comments")
                .header("Authorization", citizenAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(spoofedComment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.comments[0].authorRole").value("CITIZEN"))
                .andExpect(jsonPath("$.comments[0].authorName").value(citizenA.getFullName()));
    }

    @Test
    @DisplayName("Criterion 6: Unauthenticated request to predict-category gets 401")
    public void testPredictCategoryUnauthenticatedGets401() throws Exception {
        Map<String, String> payload = Map.of("title", "Leaking pipe", "description", "Water spilling everywhere");

        mockMvc.perform(post("/api/complaints/predict-category")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Additional Rule A.5: Councillor with another ward gets 403 on list, Citizen querying another citizenId gets 403")
    public void testListAccessEnforcement() throws Exception {
        // Councillor of Ward 1 querying Ward 2
        mockMvc.perform(get("/api/complaints?ward=Ward 2")
                .header("Authorization", councillorWard1Token))
                .andExpect(status().isForbidden());

        // Citizen Alice querying Citizen Bob's complaints
        mockMvc.perform(get("/api/complaints?citizenId=" + citizenB.getId())
                .header("Authorization", citizenAToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Additional Rule A.4: Public-safe track endpoint returns minimal fields")
    public void testPublicSafeTrackEndpoint() throws Exception {
        mockMvc.perform(get("/api/complaints/track/" + complaintWard1WorkerA.getTrackingNumber()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trackingNumber").value(complaintWard1WorkerA.getTrackingNumber()))
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.citizenPhone").doesNotExist())
                .andExpect(jsonPath("$.citizenName").doesNotExist());
    }
}
