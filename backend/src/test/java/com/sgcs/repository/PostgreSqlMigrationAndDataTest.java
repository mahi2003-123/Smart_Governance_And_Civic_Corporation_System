package com.sgcs.repository;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.sql.*;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

public class PostgreSqlMigrationAndDataTest {

    private static final String JDBC_URL = "jdbc:postgresql://localhost:5433/sgcs_test";
    private static final String USER = "postgres";
    private static final String PASS = "";

    @Test
    @DisplayName("Verify Flyway V1 and V2 migrations yield exactly 15 tables and no proposal_votes")
    public void testFlywayMigrationsYieldExact15Tables() throws Exception {
        // 1. Reset public schema cleanly using a dedicated connection
        try (Connection resetConn = DriverManager.getConnection(JDBC_URL, USER, PASS);
             Statement stmt = resetConn.createStatement()) {
            stmt.execute("DROP SCHEMA IF EXISTS public CASCADE");
            stmt.execute("CREATE SCHEMA public");
        }

        // 2. Run Flyway migrate against clean schema
        Flyway flyway = Flyway.configure()
                .dataSource(JDBC_URL, USER, PASS)
                .locations("classpath:db/migration")
                .load();

        flyway.migrate();

        // 3. Verify with JDBC
        try (Connection conn = DriverManager.getConnection(JDBC_URL, USER, PASS)) {
            // Check all tables in public schema
            List<String> tables = new ArrayList<>();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name")) {
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        String tbl = rs.getString("table_name");
                        if (!"flyway_schema_history".equals(tbl)) {
                            tables.add(tbl);
                        }
                    }
                }
            }

            // Assert exactly 16 tables after V5 decomposition and feedback drop
            List<String> expected16Tables = List.of(
                    "complaint_ai_metadata",
                    "complaint_assignments",
                    "complaint_attachments",
                    "complaint_comments",
                    "complaint_timeline",
                    "complaints",
                    "notices",
                    "notification_reads",
                    "notifications",
                    "proposal_comments",
                    "proposal_user_votes",
                    "proposals",
                    "system_activities",
                    "user_device_tokens",
                    "users",
                    "wards"
            );

            assertThat(tables).containsExactlyInAnyOrderElementsOf(expected16Tables);
            assertThat(tables).doesNotContain("proposal_votes", "complaint_feedback");

            // Check complaints columns: images, before_image, after_image, completion_image, delay_image,
            // worker assignment, and AI metadata MUST NOT exist in complaints table (decomposed in V5)
            List<String> complaintCols = new ArrayList<>();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'complaints'")) {
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        complaintCols.add(rs.getString("column_name"));
                    }
                }
            }
            assertThat(complaintCols).doesNotContain(
                    "images", "before_image", "after_image", "completion_image", "delay_image",
                    "assigned_worker_id", "assigned_worker_name", "assigned_date", "due_date", "worker_notes", "delay_reason", "delay_notes",
                    "ai_suggested_category", "ai_confidence", "ai_model", "ai_status", "is_ai_category_accepted", "master_complaint_id", "possible_duplicate_id"
            );
            assertThat(complaintCols).contains("location_address", "citizen_name", "status", "tracking_number");

            // Check complaint_assignments columns
            List<String> assignmentCols = new ArrayList<>();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'complaint_assignments'")) {
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        assignmentCols.add(rs.getString("column_name"));
                    }
                }
            }
            assertThat(assignmentCols).contains("complaint_id", "assigned_worker_id", "worker_notes", "delay_reason");

            // Check complaint_ai_metadata columns
            List<String> aiCols = new ArrayList<>();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'complaint_ai_metadata'")) {
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        aiCols.add(rs.getString("column_name"));
                    }
                }
            }
            assertThat(aiCols).contains("complaint_id", "ai_suggested_category", "ai_confidence", "possible_duplicate_id");

            // Check system_activities has module column
            List<String> actCols = new ArrayList<>();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'system_activities'")) {
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        actCols.add(rs.getString("column_name"));
                    }
                }
            }
            assertThat(actCols).contains("module");

            // Check users has must_change_password, specialization, status, address
            List<String> userCols = new ArrayList<>();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users'")) {
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        userCols.add(rs.getString("column_name"));
                    }
                }
            }
            assertThat(userCols).contains("must_change_password", "specialization", "status", "address");

            // Check notifications columns: "read" and "user_id" MUST NOT exist
            List<String> notifCols = new ArrayList<>();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications'")) {
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        notifCols.add(rs.getString("column_name"));
                    }
                }
            }
            assertThat(notifCols).doesNotContain("read", "user_id");
            assertThat(notifCols).contains("is_read", "recipient_id");

            // Test tracking_seq exists and generates sequences
            try (PreparedStatement stmt = conn.prepareStatement("SELECT nextval('tracking_seq')")) {
                try (ResultSet rs = stmt.executeQuery()) {
                    assertThat(rs.next()).isTrue();
                    long seq = rs.getLong(1);
                    assertThat(seq).isGreaterThanOrEqualTo(100000L);
                }
            }

            // Test comment persistence into complaint_comments
            String compId = "cmp_test_" + UUID.randomUUID();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO complaints (id, tracking_number, title, category, priority, description, ward, location_address, status, citizen_id, citizen_name) " +
                            "VALUES (?, ?, 'Test Pothole', 'ROADS', 'MEDIUM', 'Big pothole on the street', 'Ward 1', 'MG Road', 'PENDING', 'usr_cit', 'Alice Citizen')")) {
                stmt.setString(1, compId);
                stmt.setString(2, "SGCS-TEST-" + System.currentTimeMillis());
                stmt.executeUpdate();
            }

            String cmtId = "cmt_" + UUID.randomUUID();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO complaint_comments (complaint_id, id, author_name, author_role, author_avatar, content) " +
                            "VALUES (?, ?, 'Alice Citizen', 'CITIZEN', 'avatar.png', 'Please repair soon')")) {
                stmt.setString(1, compId);
                stmt.setString(2, cmtId);
                stmt.executeUpdate();
            }

            // Verify comment read back
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM complaint_comments WHERE complaint_id = ?")) {
                stmt.setString(1, compId);
                try (ResultSet rs = stmt.executeQuery()) {
                    assertThat(rs.next()).isTrue();
                    assertThat(rs.getInt(1)).isEqualTo(1);
                }
            }

            // Test complaint_attachments with base64 data URLs containing commas
            String complexBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD,sample,data,with,multiple,commas==";
            UUID attId = UUID.randomUUID();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO complaint_attachments (id, complaint_id, kind, content_type, size_bytes, data_url) " +
                            "VALUES (?, ?, 'REPORT', 'image/jpeg', ?, ?)")) {
                stmt.setObject(1, attId);
                stmt.setString(2, compId);
                stmt.setInt(3, complexBase64.length());
                stmt.setString(4, complexBase64);
                stmt.executeUpdate();
            }

            try (PreparedStatement stmt = conn.prepareStatement("SELECT data_url FROM complaint_attachments WHERE id = ?")) {
                stmt.setObject(1, attId);
                try (ResultSet rs = stmt.executeQuery()) {
                    assertThat(rs.next()).isTrue();
                    assertThat(rs.getString("data_url")).isEqualTo(complexBase64);
                }
            }

            // Test complaint_assignments insert and linkage
            try (PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO complaint_assignments (complaint_id, assigned_worker_name, worker_notes) VALUES (?, 'Worker Dave', 'Road patched cleanly')")) {
                stmt.setString(1, compId);
                stmt.executeUpdate();
            }

            // Test complaint_ai_metadata insert and linkage
            try (PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO complaint_ai_metadata (complaint_id, ai_suggested_category, ai_confidence) VALUES (?, 'Roads & Potholes', 0.98)")) {
                stmt.setString(1, compId);
                stmt.executeUpdate();
            }

            // Test notification reads per-user isolation
            String notifId = "notif_" + UUID.randomUUID();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO notifications (id, recipient_id, title, message, type, is_read) VALUES (?, 'ALL', 'System Update', 'Maintenance scheduled', 'NOTICE', false)")) {
                stmt.setString(1, notifId);
                stmt.executeUpdate();
            }

            // User A marks as read
            String userAId = "usr_a_" + UUID.randomUUID();
            String userBId = "usr_b_" + UUID.randomUUID();
            try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, 'User A', ?, 'h', 'CITIZEN')")) {
                stmt.setString(1, userAId);
                stmt.setString(2, userAId + "@test.com");
                stmt.executeUpdate();
            }
            try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, 'User B', ?, 'h', 'CITIZEN')")) {
                stmt.setString(1, userBId);
                stmt.setString(2, userBId + "@test.com");
                stmt.executeUpdate();
            }

            try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO notification_reads (notification_id, user_id) VALUES (?, ?)")) {
                stmt.setString(1, notifId);
                stmt.setString(2, userAId);
                stmt.executeUpdate();
            }

            // User A has read row, User B does not
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM notification_reads WHERE notification_id = ? AND user_id = ?")) {
                stmt.setString(1, notifId);
                stmt.setString(2, userAId);
                try (ResultSet rs = stmt.executeQuery()) {
                    assertThat(rs.next()).isTrue();
                    assertThat(rs.getInt(1)).isEqualTo(1);
                }

                stmt.setString(2, userBId);
                try (ResultSet rs = stmt.executeQuery()) {
                    assertThat(rs.next()).isTrue();
                    assertThat(rs.getInt(1)).isEqualTo(0);
                }
            }
        }
    }
}
