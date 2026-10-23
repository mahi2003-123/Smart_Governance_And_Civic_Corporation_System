package com.sgcs.security;

import com.sgcs.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Server-side image validator for complaints and task completion/delay proofs.
 * Enforces:
 *   - Only data:image/jpeg|png|webp;base64 or https:// URLs
 *   - Maximum 2 MB decoded size per image
 *   - Maximum 5 images per complaint
 */
@Component
public class ImageValidator {

    public static final int MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
    public static final int MAX_IMAGES_COUNT = 5;

    private static final Pattern DATA_IMAGE_PATTERN = Pattern.compile(
        "^data:image/(jpeg|jpg|png|webp);base64,(.+)$",
        Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    public void validateComplaintImages(Object images) {
        if (images == null) {
            return;
        }

        if (images instanceof List<?> list) {
            if (list.size() > MAX_IMAGES_COUNT) {
                throw new BadRequestException("Exceeded maximum of " + MAX_IMAGES_COUNT + " images per complaint");
            }
            for (int i = 0; i < list.size(); i++) {
                Object item = list.get(i);
                if (item != null && !item.toString().trim().isEmpty()) {
                    validateSingleImage(item.toString().trim(), "images[" + i + "]");
                }
            }
        } else if (images instanceof String str) {
            String trimmed = str.trim();
            if (trimmed.isEmpty()) {
                return;
            }
            validateSingleImage(trimmed, "images");
        }
    }

    public void validateSingleImage(String image, String fieldName) {
        if (image == null || image.trim().isEmpty()) {
            return;
        }

        String trimmed = image.trim();

        // 1. Check if https URL
        if (trimmed.startsWith("https://")) {
            if (trimmed.contains(" ") || trimmed.length() > 2048) {
                throw new BadRequestException("Invalid https image URL in field '" + fieldName + "'");
            }
            return;
        }

        // 2. Check if data:image/(jpeg|png|webp);base64,...
        Matcher matcher = DATA_IMAGE_PATTERN.matcher(trimmed);
        if (matcher.matches()) {
            String base64Data = matcher.group(2).replaceAll("\\s+", "");
            try {
                byte[] decoded = Base64.getDecoder().decode(base64Data);
                if (decoded.length > MAX_IMAGE_BYTES) {
                    throw new BadRequestException("Image in '" + fieldName + "' exceeds the maximum allowed size of 2 MB");
                }
                return;
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid base64 payload in field '" + fieldName + "'");
            }
        }

        throw new BadRequestException(
            "Field '" + fieldName + "' must be a valid https URL or a base64 encoded data URI (data:image/jpeg|png|webp;base64,...)"
        );
    }
}
