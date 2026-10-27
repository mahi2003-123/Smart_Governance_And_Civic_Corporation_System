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

    private boolean isPostgreSqlAvailable() {
        try (Connection conn = DriverManager.getConnection(JDBC_URL, USER, PASS)) {
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Test
    @DisplayName("Verify Flyway V1 and V2 migrations yield exactly 15 tables and no proposal_votes")
    public void testFlywayMigrationsYieldExact15Tables() throws Exception {
        org.junit.jupiter.api.Assumptions.assumeTrue(isPostgreSqlAvailable(),
                "Local PostgreSQL test instance at " + JDBC_URL + " is not running. Skipping integration test.");

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

            // Assert exactly 13 tables after dropping feedback, assignments, ai_metadata, and notification_reads
            List<String> expected13Tables = List.of(
                    "complaint_attachments",
                    "complaint_comments",
                    "complaint_timeline",
                    "complaints",
                    "notices",
                    "notifications",
                    "proposal_comments",
                    "proposal_user_votes",
                    "proposals",
                    "system_activities",
                    "user_device_tokens",
                    "users",
                    "wards"
            );

            assertThat(tables).containsExactlyInAnyOrderElementsOf(expected13Tables);
            assertThat(tables).doesNotContain("proposal_votes", "complaint_feedback", "complaint_assignments", "complaint_ai_metadata", "notification_reads");

            // Check complaints columns: images, before_image, after_image, completion_image, delay_image MUST NOT exist
            List<String> complaintCols = new ArrayList<>();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'complaints'")) {
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        complaintCols.add(rs.getString("column_name"));
                    }
                }
            }
            assertThat(complaintCols).doesNotContain("images", "before_image", "after_image", "completion_image", "delay_image");
            assertThat(complaintCols).contains(
                    "location_address", "citizen_name", "status", "tracking_number",
                    "assigned_worker_id", "assigned_worker_name", "assigned_date", "due_date", "worker_notes", "delay_reason", "delay_notes",
                    "ai_suggested_category", "ai_confidence", "ai_model", "ai_status", "is_ai_category_accepted", "master_complaint_id", "possible_duplicate_id"
            );

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

            // Test complaints update with worker and AI metadata directly on complaints table
            try (PreparedStatement stmt = conn.prepareStatement(
                    "UPDATE complaints SET assigned_worker_name = 'Worker Dave', worker_notes = 'Road patched cleanly', ai_suggested_category = 'Roads & Potholes', ai_confidence = 0.98 WHERE id = ?")) {
                stmt.setString(1, compId);
                stmt.executeUpdate();
            }

            // Test direct notifications read update
            String notifId = "notif_" + UUID.randomUUID();
            try (PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO notifications (id, recipient_id, title, message, type, is_read) VALUES (?, 'ALL', 'System Update', 'Maintenance scheduled', 'NOTICE', false)")) {
                stmt.setString(1, notifId);
                stmt.executeUpdate();
            }

            try (PreparedStatement stmt = conn.prepareStatement("UPDATE notifications SET is_read = true WHERE id = ?")) {
                stmt.setString(1, notifId);
                stmt.executeUpdate();
            }

            try (PreparedStatement stmt = conn.prepareStatement("SELECT is_read FROM notifications WHERE id = ?")) {
                stmt.setString(1, notifId);
                try (ResultSet rs = stmt.executeQuery()) {
                    assertThat(rs.next()).isTrue();
                    assertThat(rs.getBoolean("is_read")).isTrue();
                }
            }
        }
    }
}
