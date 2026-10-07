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

                    FirebaseApp.initializeApp(options);
                    System.out.println("FirebaseApp initialized successfully.");
                } else {
                    System.err.println("Warning: Firebase credentials not found. FCM notifications will fail. Please set GOOGLE_APPLICATION_CREDENTIALS or firebase.admin.credentials.json or firebase.admin.credentials.file.");
                }
            }
        } catch (IOException e) {
            System.err.println("Error initializing FirebaseApp: " + e.getMessage());
        }
    }
}
