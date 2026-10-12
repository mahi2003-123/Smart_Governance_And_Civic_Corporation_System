package com.sgcs.config;

import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class FirebaseConfigTest {

    private FirebaseConfig firebaseConfig;
    private static String validPemKey;

    @BeforeAll
    static void initKey() throws NoSuchAlgorithmException {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        KeyPair kp = kpg.generateKeyPair();
        validPemKey = "-----BEGIN PRIVATE KEY-----\\n"
                + Base64.getEncoder().encodeToString(kp.getPrivate().getEncoded())
                + "\\n-----END PRIVATE KEY-----\\n";
    }

    @BeforeEach
    void setUp() {
        firebaseConfig = new FirebaseConfig();
    }

    private GoogleCredentials createCredentialsWithProjectId(String projectIdJsonField) throws IOException {
        String json = "{\n"
                + "  \"type\": \"service_account\",\n"
                + (projectIdJsonField != null ? "  \"project_id\": " + projectIdJsonField + ",\n" : "")
                + "  \"private_key_id\": \"testkey123\",\n"
                + "  \"private_key\": \"" + validPemKey + "\",\n"
                + "  \"client_email\": \"test@sgcs-civic-system.iam.gserviceaccount.com\",\n"
                + "  \"client_id\": \"12345\",\n"
                + "  \"auth_uri\": \"https://accounts.google.com/o/oauth2/auth\",\n"
                + "  \"token_uri\": \"https://oauth2.googleapis.com/token\"\n"
                + "}";
        return GoogleCredentials.fromStream(new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    @DisplayName("Should successfully validate when credentials have exact expected project ID (sgcs-civic-system)")
    void testValidateCredentials_ValidProjectId_Success() throws IOException {
        GoogleCredentials credentials = createCredentialsWithProjectId("\"sgcs-civic-system\"");
        assertDoesNotThrow(() -> firebaseConfig.validateCredentials(credentials));
    }

    @Test
    @DisplayName("Should throw IllegalStateException when project ID is missing / null")
    void testValidateCredentials_MissingProjectId_ThrowsException() throws IOException {
        GoogleCredentials credentials = createCredentialsWithProjectId(null);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> firebaseConfig.validateCredentials(credentials)
        );

        assertTrue(exception.getMessage().contains("Firebase service-account project ID is missing"));
    }

    @Test
    @DisplayName("Should throw IllegalStateException when project ID is blank / whitespace")
    void testValidateCredentials_BlankProjectId_ThrowsException() throws IOException {
        GoogleCredentials credentials = createCredentialsWithProjectId("\"   \"");

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> firebaseConfig.validateCredentials(credentials)
        );

        assertTrue(exception.getMessage().contains("Firebase service-account project ID is missing"));
    }

    @Test
    @DisplayName("Should throw IllegalStateException when project ID does not match sgcs-civic-system")
    void testValidateCredentials_MismatchedProjectId_ThrowsException() throws IOException {
        GoogleCredentials credentials = createCredentialsWithProjectId("\"wrong-project-123\"");

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> firebaseConfig.validateCredentials(credentials)
        );

        assertTrue(exception.getMessage().contains("Firebase credentials are for project 'wrong-project-123', but expected 'sgcs-civic-system'"));
    }

    @Test
    @DisplayName("Should throw IllegalStateException when credentials are not ServiceAccountCredentials")
    void testValidateCredentials_NonServiceAccount_ThrowsException() {
        GoogleCredentials credentials = GoogleCredentials.create(
                new AccessToken("test-token", new Date(System.currentTimeMillis() + 3600000))
        );

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> firebaseConfig.validateCredentials(credentials)
        );

        assertTrue(exception.getMessage().contains("Must be a Service Account JSON"));
    }

    @Test
    @DisplayName("Should verify EXPECTED_PROJECT_ID constant is sgcs-civic-system")
    void testExpectedProjectIdConstant() {
        assertEquals("sgcs-civic-system", FirebaseConfig.EXPECTED_PROJECT_ID);
    }
}
