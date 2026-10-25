package com.sgcs.service;

import com.sgcs.entity.Complaint;
import com.sgcs.entity.Notification;
import com.sgcs.repository.ComplaintRepository;
import com.sgcs.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class ComplaintServiceAiTest {

    private ComplaintService complaintService;
    private ComplaintRepository complaintRepository;
    private AuditService auditService;
    private NotificationService notificationService;
    private FirebaseNotificationService firebaseNotificationService;
    private UserRepository userRepository;

    private Map<String, Object> predictResponse;
    private Map<String, Object> dupResponse;
    private final List<Notification> capturedNotifications = new ArrayList<>();
    private final Map<String, Complaint> databaseStore = new HashMap<>();

    @BeforeEach
    public void setup() {
        complaintService = new ComplaintService();
        complaintRepository = mock(ComplaintRepository.class);
        userRepository = mock(UserRepository.class);

        // Subclass services directly to avoid ByteBuddy class instrumentation on Java 25
        auditService = new AuditService() {
            @Override
            public void logActivity(String userId, String userName, String userRole, String action, String module, String reference, String details) {
                // no-op
            }
        };

        notificationService = new NotificationService() {
            @Override
            public Notification createNotification(Notification notification) {
                if (notification.getId() == null) {
                    notification.setId("notif_" + System.currentTimeMillis());
                }
                capturedNotifications.add(notification);
                return notification;
            }
        };

        firebaseNotificationService = new FirebaseNotificationService() {
            @Override
            public CompletableFuture<String> sendPushNotification(String userId, String title, String body, String type, String linkUrl) {
                return CompletableFuture.completedFuture("mock-sent");
            }

            @Override
            public CompletableFuture<String> sendUrgentTaskPushNotification(String workerId, String taskId, String trackingNumber, String complaintTitle, String ward, String location) {
                return CompletableFuture.completedFuture("mock-sent");
            }
        };

        capturedNotifications.clear();
        databaseStore.clear();

        predictResponse = new HashMap<>();
        predictResponse.put("category", "ROAD");
        predictResponse.put("confidence", 0.985);
        predictResponse.put("model", "Calibrated LinearSVC");

        dupResponse = new HashMap<>();
        dupResponse.put("possible_duplicate_id", null);
        dupResponse.put("similarity", 0.0);

        RestTemplate testRestTemplate = new RestTemplate() {
            @Override
            @SuppressWarnings("unchecked")
            public <T> ResponseEntity<T> postForEntity(String url, Object request, Class<T> responseType, Object... uriVariables) {
                if (url.contains("/predict")) {
                    return (ResponseEntity<T>) new ResponseEntity<>(predictResponse, HttpStatus.OK);
                }
                if (url.contains("/ai/duplicate-check")) {
                    return (ResponseEntity<T>) new ResponseEntity<>(dupResponse, HttpStatus.OK);
                }
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        };

        ReflectionTestUtils.setField(complaintService, "complaintRepository", complaintRepository);
        ReflectionTestUtils.setField(complaintService, "auditService", auditService);
        ReflectionTestUtils.setField(complaintService, "notificationService", notificationService);
        ReflectionTestUtils.setField(complaintService, "firebaseNotificationService", firebaseNotificationService);
        ReflectionTestUtils.setField(complaintService, "userRepository", userRepository);
        ReflectionTestUtils.setField(complaintService, "accessGuard", new com.sgcs.security.AccessGuard());
        ReflectionTestUtils.setField(complaintService, "restTemplate", testRestTemplate);
        ReflectionTestUtils.setField(complaintService, "aiServiceUrl", "https://smart-governance-and-civic-corporation-7q2c.onrender.com");

        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> {
            Complaint c = invocation.getArgument(0);
            if (c.getId() == null) {
                c.setId("cmp_" + UUID.randomUUID().toString().substring(0, 8));
            }
            if (c.getTrackingNumber() == null) {
                c.setTrackingNumber("TRK-" + System.currentTimeMillis());
            }
            databaseStore.put(c.getId(), c);
            return c;
        });

        when(complaintRepository.findAll()).thenAnswer(invocation -> new ArrayList<>(databaseStore.values()));
        when(complaintRepository.findActiveComplaints()).thenAnswer(invocation -> new ArrayList<>(databaseStore.values()));
        when(complaintRepository.findRecentActiveComplaints(any(LocalDateTime.class))).thenAnswer(invocation -> new ArrayList<>(databaseStore.values()));
        when(complaintRepository.findRecentActiveComplaintsByWard(anyString(), any(LocalDateTime.class), any())).thenAnswer(invocation -> new ArrayList<>(databaseStore.values()));
        when(complaintRepository.findById(anyString())).thenAnswer(invocation -> {
            String key = invocation.getArgument(0);
            return Optional.ofNullable(databaseStore.get(key));
        });
        when(complaintRepository.findByIdOrTrackingNumber(anyString(), anyString())).thenAnswer(invocation -> {
            String key = invocation.getArgument(0);
            return Optional.ofNullable(databaseStore.get(key));
        });
    }

    @Test
    @DisplayName("Should auto-adopt AI predicted category when citizen selects Other")
    public void testCreateComplaintAutoAdoptsAiCategoryWhenOther() {
        Complaint complaint = new Complaint();
        complaint.setTitle("Massive Crater on Main Street");
        complaint.setDescription("Deep pothole causing motorbikes to crash");
        complaint.setCategory("Other");
        complaint.setPriority("MEDIUM");
        complaint.setWard("Ward 1 - Central Town");
        complaint.setLocationAddress("Main Street near junction");
        complaint.setCitizenId("usr_cit_01");
        complaint.setCitizenName("John Resident");
        complaint.setCitizenPhone("9876543210");

        Complaint created = complaintService.createComplaint(complaint);

        assertNotNull(created.getId());
        assertEquals("ROAD", created.getCategory(), "AI predicted category ROAD should be adopted when citizen chose Other");
        assertEquals("ROAD", created.getAiSuggestedCategory());
        assertEquals("COMPLETED", created.getAiStatus());
        assertEquals(0.985, created.getAiConfidence());
    }

    @Test
    @DisplayName("Should preserve citizen selected category even if AI predicts differently")
    public void testCreateComplaintPreservesCitizenSelectedCategory() {
        Complaint complaint = new Complaint();
        complaint.setTitle("Water Leakage on Street");
        complaint.setDescription("Clean tap water gushing from broken pipe");
        complaint.setCategory("WATER_SUPPLY");
        complaint.setPriority("HIGH");
        complaint.setWard("Ward 1 - Central Town");
        complaint.setLocationAddress("Cross road 2");
        complaint.setCitizenId("usr_cit_02");
        complaint.setCitizenName("Jane Citizen");
        complaint.setCitizenPhone("9876543211");

        Complaint created = complaintService.createComplaint(complaint);

        assertNotNull(created.getId());
        assertEquals("WATER_SUPPLY", created.getCategory(), "Citizen-selected category WATER_SUPPLY must be preserved!");
        assertEquals("ROAD", created.getAiSuggestedCategory(), "AI suggested category should be recorded separately");
    }

    @Test
    @DisplayName("Should dispatch emergency alert notification when complaint priority is URGENT")
    public void testCreateComplaintDispatchesUrgentNotificationWhenUrgent() {
        Complaint complaint = new Complaint();
        complaint.setTitle("Dangerous Live Electrical Wire Hanging");
        complaint.setDescription("Sparks flying from broken wire on wet ground");
        complaint.setCategory("STREET_LIGHT");
        complaint.setPriority("URGENT");
        complaint.setWard("Ward 3 - East Hill View");
        complaint.setLocationAddress("Opposite school");
        complaint.setCitizenId("usr_cit_03");
        complaint.setCitizenName("Emergency Reporter");
        complaint.setCitizenPhone("9876543212");

        Complaint created = complaintService.createComplaint(complaint);

        assertNotNull(created.getId());
        assertEquals("URGENT", created.getPriority());

        boolean foundEmergencyAlert = capturedNotifications.stream()
                .anyMatch(n -> n.getTitle().contains("EMERGENCY") && n.getRecipientId().equals("ward_" + created.getWard()));
        assertTrue(foundEmergencyAlert, "Emergency alert should be dispatched to ward officials for urgent complaint");
    }

    @Test
    @DisplayName("Should record possibleDuplicateId and similarity when duplicate is found")
    public void testDuplicateDetectionPopulatesPossibleDuplicateId() {
        Complaint existing = new Complaint();
        existing.setId("cmp_master_001");
        existing.setTrackingNumber("TRK-DUP-01");
        existing.setTitle("Pothole near Central Bank");
        existing.setDescription("Pothole on Main Street in front of Central Bank");
        existing.setCategory("ROAD");
        existing.setPriority("MEDIUM");
        existing.setWard("Ward 1 - Central Town");
        existing.setLocationAddress("Main Street near Central Bank");
        existing.setStatus("PENDING");
        existing.setCitizenId("usr_cit_01");
        existing.setCitizenName("Existing Reporter");
        existing.setCitizenPhone("9876543210");
        existing.setCreatedAt(LocalDateTime.now());
        existing.setUpdatedAt(LocalDateTime.now());
        databaseStore.put("cmp_master_001", existing);

        dupResponse.put("possible_duplicate_id", "cmp_master_001");
        dupResponse.put("similarity", 0.85);

        Complaint newComplaint = new Complaint();
        newComplaint.setTitle("Deep Pothole at Central Bank");
        newComplaint.setDescription("Huge hole in road opposite Central Bank branch");
        newComplaint.setCategory("ROAD");
        newComplaint.setPriority("MEDIUM");
        newComplaint.setWard("Ward 1 - Central Town");
        newComplaint.setLocationAddress("Opposite Central Bank, Main Street");
        newComplaint.setCitizenId("usr_cit_04");
        newComplaint.setCitizenName("Second Reporter");
        newComplaint.setCitizenPhone("9876543213");

        Complaint created = complaintService.createComplaint(newComplaint);

        assertEquals("cmp_master_001", created.getPossibleDuplicateId());
        assertEquals(0.85, created.getDuplicateSimilarityScore());
    }

    @Test
    @DisplayName("Should notify citizen and dispatch alerts when priority is escalated to URGENT")
    public void testUpdatePriorityToUrgentNotifiesCitizenAndWard() {
        Complaint complaint = new Complaint();
        complaint.setId("cmp_005");
        complaint.setTitle("Overflowing Gutter");
        complaint.setDescription("Gutter water leaking into houses");
        complaint.setCategory("DRAINAGE");
        complaint.setPriority("MEDIUM");
        complaint.setStatus("PENDING");
        complaint.setWard("Ward 2 - Riverside North");
        complaint.setLocationAddress("Lane 5");
        complaint.setCitizenId("usr_cit_05");
        complaint.setCitizenName("Citizen Resident");
        complaint.setCitizenPhone("9876543214");
        complaint.setTrackingNumber("TRK-005");
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());
        databaseStore.put("cmp_005", complaint);

        Complaint updated = complaintService.updatePriority(
                "cmp_005", "URGENT", "councillor_01", "Councillor Smith", "COUNCILLOR", "Ward 2 - Riverside North"
        );

        assertEquals("URGENT", updated.getPriority());

        boolean notifiedCitizen = capturedNotifications.stream()
                .anyMatch(n -> "usr_cit_05".equals(n.getRecipientId()) && n.getTitle().contains("Escalated to URGENT"));
        assertTrue(notifiedCitizen, "Citizen should be notified when their complaint is escalated to URGENT");
    }
}
