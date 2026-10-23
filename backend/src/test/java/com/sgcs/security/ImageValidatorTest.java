package com.sgcs.security;

import com.sgcs.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ImageValidatorTest {

    private ImageValidator imageValidator;

    @BeforeEach
    public void setup() {
        imageValidator = new ImageValidator();
    }

    @Test
    @DisplayName("Should accept valid https URLs")
    public void testValidHttpsUrl() {
        assertDoesNotThrow(() -> {
            imageValidator.validateSingleImage("https://example.com/photos/pothole.jpg", "testImage");
        });
    }

    @Test
    @DisplayName("Should reject non-https URLs")
    public void testRejectHttpUrl() {
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            imageValidator.validateSingleImage("http://insecure-site.com/image.png", "testImage");
        });
        assertTrue(ex.getMessage().contains("must be a valid https URL or a base64 encoded data URI"));
    }

    @Test
    @DisplayName("Should accept valid base64 data URI within 2 MB")
    public void testValidBase64DataUri() {
        byte[] sampleBytes = "test image binary content".getBytes();
        String base64 = Base64.getEncoder().encodeToString(sampleBytes);
        String dataUri = "data:image/jpeg;base64," + base64;

        assertDoesNotThrow(() -> {
            imageValidator.validateSingleImage(dataUri, "afterImage");
        });
    }

    @Test
    @DisplayName("Should reject base64 image exceeding 2 MB decoded size")
    public void testRejectOversizedBase64Image() {
        // 2 MB + 10 bytes = 2,097,162 bytes
        byte[] largeBytes = new byte[2 * 1024 * 1024 + 10];
        String largeBase64 = Base64.getEncoder().encodeToString(largeBytes);
        String dataUri = "data:image/png;base64," + largeBase64;

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            imageValidator.validateSingleImage(dataUri, "completionImage");
        });
        assertTrue(ex.getMessage().contains("exceeds the maximum allowed size of 2 MB"));
    }

    @Test
    @DisplayName("Should accept up to 5 valid images for a complaint")
    public void testAcceptUpToFiveImages() {
        List<String> images = List.of(
            "https://cdn.example.com/1.png",
            "https://cdn.example.com/2.png",
            "https://cdn.example.com/3.png",
            "https://cdn.example.com/4.png",
            "https://cdn.example.com/5.png"
        );

        assertDoesNotThrow(() -> {
            imageValidator.validateComplaintImages(images);
        });
    }

    @Test
    @DisplayName("Should reject more than 5 images for a complaint")
    public void testRejectMoreThanFiveImages() {
        List<String> images = List.of(
            "https://cdn.example.com/1.png",
            "https://cdn.example.com/2.png",
            "https://cdn.example.com/3.png",
            "https://cdn.example.com/4.png",
            "https://cdn.example.com/5.png",
            "https://cdn.example.com/6.png"
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            imageValidator.validateComplaintImages(images);
        });
        assertTrue(ex.getMessage().contains("Exceeded maximum of 5 images"));
    }

    @Test
    @DisplayName("Should reject invalid image scheme or plain text")
    public void testRejectInvalidScheme() {
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            imageValidator.validateSingleImage("javascript:alert(1)", "delayImage");
        });
        assertTrue(ex.getMessage().contains("must be a valid https URL or a base64 encoded data URI"));
    }
}
