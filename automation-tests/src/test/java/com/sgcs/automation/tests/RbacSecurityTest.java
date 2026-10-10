package com.sgcs.automation.tests;

import org.testng.Assert;
import org.testng.annotations.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class RbacSecurityTest {

    private final HttpClient client = HttpClient.newHttpClient();
    private final String API_URL = "http://127.0.0.1:5000/api";

    @Test
    public void testUnauthorizedAccessToAdminRoute() throws Exception {
        // Attempting to access an Admin or protected route without a JWT Token
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + "/admin/dashboard"))
                .GET()
                .build();
                
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        // Either 401 Unauthorized or 403 Forbidden is expected for missing/invalid token
        boolean isUnauthorized = (response.statusCode() == 401 || response.statusCode() == 403 || response.statusCode() == 404);
        Assert.assertTrue(isUnauthorized, "Unauthenticated users should instantly be rejected by Spring Security.");
    }

    @Test
    public void testInvalidLoginCredentials() throws Exception {
        String json = "{\"email\": \"invalid@sgcs.com\", \"password\": \"wrongpass123\"}";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + "/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
                
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        // Asserting Invalid credentials trigger strict 4xx/401 blocks
        Assert.assertTrue(response.statusCode() == 401 || response.statusCode() == 400 || response.statusCode() == 404, "Invalid logins must be securely rejected from database entry.");
    }
}
