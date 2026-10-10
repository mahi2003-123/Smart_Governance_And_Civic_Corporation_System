package com.sgcs.automation.tests;

import org.testng.Assert;
import org.testng.annotations.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;


// Using simple string manipulation instead of importing large JSON libraries to keep dependencies minimal
public class AiModuleApiTest {

    private final HttpClient client = HttpClient.newHttpClient();
    private final String AI_URL = "http://127.0.0.1:8000";

    private String sendPostRequest(String endpoint, String jsonBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(AI_URL + endpoint))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        Assert.assertEquals(response.statusCode(), 200, "AI Service returned non-200 code");
        return response.body();
    }

    @Test
    public void testAiPredictionRoad() throws Exception {
        String json = "{\"title\": \"Huge pothole\", \"description\": \"There is a massive pothole causing accidents on Main Street.\"}";
        String response = sendPostRequest("/predict", json);
        Assert.assertTrue(response.contains("\"category\":\"ROAD\""), "Should predict ROAD");
        Assert.assertTrue(response.contains("\"confidence\":"), "Should return confidence score");
    }

    @Test
    public void testAiPredictionWaterSupply() throws Exception {
        String json = "{\"title\": \"No water for 3 days\", \"description\": \"The municipal water supply has been completely dry in North Ward.\"}";
        String response = sendPostRequest("/predict", json);
        Assert.assertTrue(response.contains("\"category\":\"WATER_SUPPLY\""), "Should predict WATER_SUPPLY");
    }

    @Test
    public void testDuplicateDetectionStrongCandidate() throws Exception {
        String json = "{" +
                "\"new_complaint\": {\"id\": \"new1\", \"location\": \"Main St\", \"ward\": \"Ward A\", \"category\": \"ROAD\", \"description\": \"Large pothole on the road\"}," +
                "\"existing_complaints\": [" +
                "  {\"id\": \"old1\", \"location\": \"Main Street\", \"ward\": \"Ward A\", \"category\": \"ROAD\", \"description\": \"Huge pothole here\", \"status\": \"PENDING\"}" +
                "]}";
        
        String response = sendPostRequest("/duplicate-check", json);
        Assert.assertTrue(response.contains("\"is_duplicate\":true"), "Should flag as duplicate because Ward, Location, and Semantic description strongly match.");
    }

    @Test
    public void testDuplicateDetectionDifferentWard() throws Exception {
        String json = "{" +
                "\"new_complaint\": {\"id\": \"new1\", \"location\": \"Main St\", \"ward\": \"Ward B\", \"category\": \"ROAD\", \"description\": \"Large pothole on the road\"}," +
                "\"existing_complaints\": [" +
                "  {\"id\": \"old1\", \"location\": \"Main Street\", \"ward\": \"Ward A\", \"category\": \"ROAD\", \"description\": \"Huge pothole here\", \"status\": \"PENDING\"}" +
                "]}";
        
        String response = sendPostRequest("/duplicate-check", json);
        Assert.assertTrue(response.contains("\"is_duplicate\":false"), "Different Wards must firmly reject duplicate possibility immediately");
    }

    @Test
    public void testDuplicateDetectionResolvedIgnored() throws Exception {
        String json = "{" +
                "\"new_complaint\": {\"id\": \"new1\", \"location\": \"Main St\", \"ward\": \"Ward A\", \"category\": \"ROAD\", \"description\": \"Large pothole on the road\"}," +
                "\"existing_complaints\": [" +
                "  {\"id\": \"old1\", \"location\": \"Main Street\", \"ward\": \"Ward A\", \"category\": \"ROAD\", \"description\": \"Huge pothole here\", \"status\": \"RESOLVED\"}" +
                "]}";
        
        String response = sendPostRequest("/duplicate-check", json);
        Assert.assertTrue(response.contains("\"is_duplicate\":false"), "A Resolved past complaint must explicitly be excluded from halting a new active complaint.");
    }
}
