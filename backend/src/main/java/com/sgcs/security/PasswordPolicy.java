package com.sgcs.security;

import com.sgcs.exception.BadRequestException;
import java.security.SecureRandom;

public class PasswordPolicy {

    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String DIGIT = "0123456789";
    private static final String SPECIAL = "!@#$%^&*()-_=+";
    private static final String ALL_CHARS = CHAR_UPPER + CHAR_LOWER + DIGIT + SPECIAL;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Requirement 3: Password policy for register, admin create and change:
     * minimum 8 characters, at least one letter and one number. Do NOT trim passwords.
     */
    public static void validate(String password) {
        if (password == null || password.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }
        boolean hasLetter = false;
        boolean hasDigit = false;
        for (char c : password.toCharArray()) {
            if (Character.isLetter(c)) hasLetter = true;
            if (Character.isDigit(c)) hasDigit = true;
        }
        if (!hasLetter || !hasDigit) {
            throw new BadRequestException("Password must contain at least one letter and one number.");
        }
    }

    /**
     * Requirement 1: Generate a random 12+ char temporary password satisfying policy.
     */
    public static String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder(14);
        sb.append(CHAR_UPPER.charAt(RANDOM.nextInt(CHAR_UPPER.length())));
        sb.append(CHAR_LOWER.charAt(RANDOM.nextInt(CHAR_LOWER.length())));
        sb.append(DIGIT.charAt(RANDOM.nextInt(DIGIT.length())));
        sb.append(SPECIAL.charAt(RANDOM.nextInt(SPECIAL.length())));

        for (int i = 4; i < 14; i++) {
            sb.append(ALL_CHARS.charAt(RANDOM.nextInt(ALL_CHARS.length())));
        }

        char[] chars = sb.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = RANDOM.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }
        return new String(chars);
    }
}
