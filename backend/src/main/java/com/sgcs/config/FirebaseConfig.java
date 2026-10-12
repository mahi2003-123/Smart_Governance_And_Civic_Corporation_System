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

import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!test")
public class FirebaseConfig {

    public static final String EXPECTED_PROJECT_ID = "sgcs-civic-system";

    @Value("${firebase.admin.credentials.json:#{null}}")
    private String firebaseAdminCredentialsJson;

    @Value("${firebase.admin.credentials.file:#{null}}")
    private String firebaseAdminCredentialsFile;

    /**
     * Validates that the provided GoogleCredentials is a ServiceAccountCredentials instance,
     * contains a non-empty project ID, and exactly matches the expected SGCS project ID.
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

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                System.out.println("--- Firebase Config Diagnostic Logging ---");
                System.out.println("ENV GOOGLE_APPLICATION_CREDENTIALS: " + (System.getenv("GOOGLE_APPLICATION_CREDENTIALS") != null ? "CONFIGURED" : "NOT CONFIGURED"));
                System.out.println("Property firebase.admin.credentials.json: " + (firebaseAdminCredentialsJson != null && !firebaseAdminCredentialsJson.trim().isEmpty() ? "CONFIGURED (Length: " + firebaseAdminCredentialsJson.length() + ")" : "NOT CONFIGURED"));
                System.out.println("Property firebase.admin.credentials.file: " + (firebaseAdminCredentialsFile != null && !firebaseAdminCredentialsFile.trim().isEmpty() ? firebaseAdminCredentialsFile : "NOT CONFIGURED"));

                if (firebaseAdminCredentialsFile != null && !firebaseAdminCredentialsFile.trim().isEmpty()) {
                    java.io.File file = new java.io.File(firebaseAdminCredentialsFile);
                    if (!file.exists()) {
                        System.out.println("DIAGNOSTIC WARNING: The specified FIREBASE_CREDENTIALS_FILE path (" + firebaseAdminCredentialsFile + ") DOES NOT exist on the filesystem.");
                    } else if (!file.canRead()) {
                        System.out.println("DIAGNOSTIC WARNING: The specified FIREBASE_CREDENTIALS_FILE path exists, but is NOT READABLE (permission denied).");
                    } else {
                        System.out.println("DIAGNOSTIC SUCCESS: The specified FIREBASE_CREDENTIALS_FILE path exists and is readable.");
                    }
                }
                
                // Extra check for Render's default secret file mount (fallback if env var wasn't mapped)
                java.io.File renderDefaultFallback = new java.io.File("/etc/secrets/firebase-admin.json");
                if (renderDefaultFallback.exists() && renderDefaultFallback.canRead()) {
                	System.out.println("DIAGNOSTIC INFO: Discovered raw secret file at standard Render mount path: /etc/secrets/firebase-admin.json");
                }
                System.out.println("------------------------------------------");

                InputStream credentialsStream = null;
                try {
                    java.io.File credentialFile = null;
                    if (firebaseAdminCredentialsFile != null && !firebaseAdminCredentialsFile.trim().isEmpty()) {
                        credentialFile = new java.io.File(firebaseAdminCredentialsFile);
                    }
                    
                    java.io.File googleAppCredFile = null;
                    String googleEnv = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
                    if (googleEnv != null && !googleEnv.trim().isEmpty()) {
                        googleAppCredFile = new java.io.File(googleEnv);
                    }

                    if (firebaseAdminCredentialsJson != null && !firebaseAdminCredentialsJson.trim().isEmpty()) {
                        credentialsStream = new ByteArrayInputStream(firebaseAdminCredentialsJson.getBytes(StandardCharsets.UTF_8));
                    } else if (credentialFile != null) {
                        if (credentialFile.exists() && credentialFile.canRead()) {
                            credentialsStream = new FileInputStream(credentialFile);
                        } else {
                            throw new IllegalStateException("Configured FIREBASE_CREDENTIALS_FILE (" + firebaseAdminCredentialsFile + ") does not exist or is not readable.");
                        }
                    } else if (renderDefaultFallback.exists() && renderDefaultFallback.canRead()) {
                        // Automatically support Render secret files
                        credentialsStream = new FileInputStream(renderDefaultFallback);
                    } else if (googleAppCredFile != null && googleAppCredFile.exists() && googleAppCredFile.canRead()) {
                        credentialsStream = new FileInputStream(googleAppCredFile);
                    } 

                    if (credentialsStream != null) {
                        GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream);
                        
                        // Strict safety validation ensuring correct Firebase Project BEFORE initializing!
                        validateCredentials(credentials);
                        
                        FirebaseOptions options = FirebaseOptions.builder()
                                .setCredentials(credentials)
                                .setProjectId(EXPECTED_PROJECT_ID)
                                .build();

                        FirebaseApp.initializeApp(options);
                        
                        System.out.println("FirebaseApp initialized successfully for project " + EXPECTED_PROJECT_ID + ".");
                    } else {
                        System.err.println("Firebase Admin JSON credentials are missing. Please provide FIREBASE_CREDENTIALS_FILE or a valid configuration.");
                        throw new IllegalStateException("Firebase Admin JSON credentials are missing. Please provide FIREBASE_CREDENTIALS_FILE setting.");
                    }
                } finally {
                    if (credentialsStream != null) {
                        try {
                            credentialsStream.close();
                        } catch (IOException ignored) {}
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error initializing FirebaseApp: Failed to load valid Firebase credentials. (Cause: " + e.getMessage() + ")");
            throw new IllegalStateException("Failed to initialize Firebase Admin SDK", e);
        }
    }
}
