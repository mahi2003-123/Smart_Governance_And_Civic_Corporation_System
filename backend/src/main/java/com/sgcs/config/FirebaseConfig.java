package com.sgcs.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!test")
public class FirebaseConfig {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    public static final String EXPECTED_PROJECT_ID = "sgcs-civic-system";

    @Value("${firebase.enabled:false}")
    private boolean firebaseEnabled;

    @Value("${firebase.admin.credentials.json:#{null}}")
    private String firebaseAdminCredentialsJson;

    @Value("${firebase.admin.credentials.file:#{null}}")
    private String firebaseAdminCredentialsFile;

    /**
     * Validates that the provided GoogleCredentials is a ServiceAccountCredentials
     * for the expected SGCS Firebase project. Throws IllegalStateException on mismatch.
     * Used internally during initialization and by unit tests.
     */
    public void validateCredentials(GoogleCredentials credentials) {
        if (!(credentials instanceof ServiceAccountCredentials)) {
            throw new IllegalStateException("Invalid Firebase credentials provided. Must be a Service Account JSON.");
        }
        String projectId = ((ServiceAccountCredentials) credentials).getProjectId();
        if (projectId == null || projectId.trim().isEmpty()) {
            throw new IllegalStateException("Firebase service-account project ID is missing in provided credentials.");
        }
        if (!EXPECTED_PROJECT_ID.equals(projectId.trim())) {
            throw new IllegalStateException("Firebase credentials are for project '" + projectId + "', but expected '" + EXPECTED_PROJECT_ID + "'");
        }
    }

    /**
     * Returns true if FirebaseApp has been successfully initialized.
     * Use this guard before every FCM call.
     */
    public static boolean isInitialized() {
        return !FirebaseApp.getApps().isEmpty();
    }

    @PostConstruct
    public void initialize() {
        if (!firebaseEnabled) {
            logger.warn("Firebase is DISABLED (firebase.enabled=false). Push notifications will be skipped.");
            return;
        }

        if (!FirebaseApp.getApps().isEmpty()) {
            logger.info("FirebaseApp already initialized — skipping.");
            return;
        }

        logger.info("--- Firebase Config Diagnostic ---");
        logger.info("ENV GOOGLE_APPLICATION_CREDENTIALS: {}",
            System.getenv("GOOGLE_APPLICATION_CREDENTIALS") != null ? "CONFIGURED" : "NOT CONFIGURED");
        logger.info("Property firebase.admin.credentials.json: {}",
            (firebaseAdminCredentialsJson != null && !firebaseAdminCredentialsJson.trim().isEmpty())
                ? "CONFIGURED (length=" + firebaseAdminCredentialsJson.length() + ")" : "NOT CONFIGURED");
        logger.info("Property firebase.admin.credentials.file: {}",
            (firebaseAdminCredentialsFile != null && !firebaseAdminCredentialsFile.trim().isEmpty())
                ? firebaseAdminCredentialsFile : "NOT CONFIGURED");

        java.io.File renderDefaultFallback = new java.io.File("/etc/secrets/firebase-admin.json");
        if (renderDefaultFallback.exists() && renderDefaultFallback.canRead()) {
            logger.info("Discovered secret file at Render mount path: /etc/secrets/firebase-admin.json");
        }
        logger.info("----------------------------------");

        InputStream credentialsStream = null;
        try {
            // Credential resolution order:
            // 1. firebase.admin.credentials.json (env-injected JSON string)
            // 2. firebase.admin.credentials.file (explicit file path)
            // 3. /etc/secrets/firebase-admin.json (Render secret file mount)
            // 4. GOOGLE_APPLICATION_CREDENTIALS env var
            if (firebaseAdminCredentialsJson != null && !firebaseAdminCredentialsJson.trim().isEmpty()) {
                credentialsStream = new ByteArrayInputStream(
                    firebaseAdminCredentialsJson.getBytes(StandardCharsets.UTF_8));
                logger.info("Using firebase.admin.credentials.json property.");
            } else if (firebaseAdminCredentialsFile != null && !firebaseAdminCredentialsFile.trim().isEmpty()) {
                java.io.File credFile = new java.io.File(firebaseAdminCredentialsFile);
                if (credFile.exists() && credFile.canRead()) {
                    credentialsStream = new FileInputStream(credFile);
                    logger.info("Using firebase.admin.credentials.file: {}", firebaseAdminCredentialsFile);
                } else {
                    logger.warn("Configured FIREBASE_CREDENTIALS_FILE '{}' does not exist or is not readable. Skipping Firebase init.", firebaseAdminCredentialsFile);
                    return;
                }
            } else if (renderDefaultFallback.exists() && renderDefaultFallback.canRead()) {
                credentialsStream = new FileInputStream(renderDefaultFallback);
                logger.info("Using Render secret file /etc/secrets/firebase-admin.json.");
            } else {
                String googleEnv = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
                if (googleEnv != null && !googleEnv.trim().isEmpty()) {
                    java.io.File googleFile = new java.io.File(googleEnv);
                    if (googleFile.exists() && googleFile.canRead()) {
                        credentialsStream = new FileInputStream(googleFile);
                        logger.info("Using GOOGLE_APPLICATION_CREDENTIALS: {}", googleEnv);
                    }
                }
            }

            if (credentialsStream == null) {
                logger.warn("No Firebase credentials found. Firebase Cloud Messaging is DISABLED.");
                return;
            }

            GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream);

            // Validate it is a service account for the correct project
            if (!(credentials instanceof ServiceAccountCredentials)) {
                logger.warn("Provided Firebase credentials are not a ServiceAccountCredentials. Skipping Firebase init.");
                return;
            }
            String projectId = ((ServiceAccountCredentials) credentials).getProjectId();
            if (!EXPECTED_PROJECT_ID.equals(projectId != null ? projectId.trim() : "")) {
                logger.warn("Firebase credentials are for project '{}', expected '{}'. Skipping Firebase init.", projectId, EXPECTED_PROJECT_ID);
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .setProjectId(EXPECTED_PROJECT_ID)
                    .build();

            FirebaseApp.initializeApp(options);
            logger.info("FirebaseApp initialized successfully for project '{}'.", EXPECTED_PROJECT_ID);

        } catch (Exception e) {
            // Log a WARN — do NOT re-throw.  The app must start even without Firebase.
            logger.warn("Firebase initialization failed (push notifications disabled): {}", e.getMessage());
        } finally {
            if (credentialsStream != null) {
                try { credentialsStream.close(); } catch (IOException ignored) {}
            }
        }
    }
}
