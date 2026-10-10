package com.sgcs.config;

import com.google.auth.oauth2.GoogleCredentials;
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

@Configuration
public class FirebaseConfig {

    @Value("${firebase.admin.credentials.json:#{null}}")
    private String firebaseAdminCredentialsJson;

    @Value("${firebase.admin.credentials.file:#{null}}")
    private String firebaseAdminCredentialsFile;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream credentialsStream = null;

                if (firebaseAdminCredentialsJson != null && !firebaseAdminCredentialsJson.trim().isEmpty()) {
                    credentialsStream = new ByteArrayInputStream(firebaseAdminCredentialsJson.getBytes(StandardCharsets.UTF_8));
                } else if (firebaseAdminCredentialsFile != null && !firebaseAdminCredentialsFile.trim().isEmpty()) {
                    credentialsStream = new FileInputStream(firebaseAdminCredentialsFile);
                } else if (System.getenv("GOOGLE_APPLICATION_CREDENTIALS") != null) {
                    credentialsStream = new FileInputStream(System.getenv("GOOGLE_APPLICATION_CREDENTIALS"));
                } 

                if (credentialsStream != null) {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                            .build();

                    FirebaseApp app = FirebaseApp.initializeApp(options);
                    String projectId = app.getOptions().getProjectId();
                    
                    if (projectId != null && !projectId.equals("sgcs-civic-system")) {
                        throw new IllegalStateException("Firebase credentials are for project '" + projectId + "', but expected 'sgcs-civic-system'");
                    }
                    
                    System.out.println("FirebaseApp initialized successfully for project sgcs-civic-system.");
                } else {
                    throw new IllegalStateException("Firebase Admin JSON credentials are missing. Please provide FIREBASE_CREDENTIALS_FILE setting.");
                }
            }
        } catch (Exception e) {
            System.err.println("Error initializing FirebaseApp: Failed to load valid Firebase credentials. (Cause: " + e.getMessage() + ")");
            throw new IllegalStateException("Failed to initialize Firebase Admin SDK", e);
        }
    }
}
