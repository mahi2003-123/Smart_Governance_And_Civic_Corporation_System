package com.sgcs.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TwilioSmsService {

    private static final Logger logger = LoggerFactory.getLogger(TwilioSmsService.class);

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.from-number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        try {
            if (accountSid != null && !accountSid.isEmpty() && authToken != null && !authToken.isEmpty() && !accountSid.contains("placeholder")) {
                Twilio.init(accountSid, authToken);
                logger.info("Twilio SDK initialized successfully.");
            } else {
                logger.warn("Twilio credentials skipped or using placeholders. SMS sending will fail.");
            }
        } catch (Exception e) {
            logger.error("Failed to initialize Twilio: {}", e.getMessage());
        }
    }

    public boolean sendSms(String toPhoneNumber, String messageBody) {
        if (toPhoneNumber == null || toPhoneNumber.trim().isEmpty()) {
            logger.error("SMS failed: Recipient phone number is missing or empty.");
            return false;
        }
        
        try {
            // Basic phone format normalization (ensure it starts with '+' for Twilio)
            String normalizedPhone = toPhoneNumber.trim();
            if (!normalizedPhone.startsWith("+")) {
                // Default to +91 (India) if no country code provided, just as a safety net
                normalizedPhone = "+91" + normalizedPhone;
            }

            Message message = Message.creator(
                    new PhoneNumber(normalizedPhone),
                    new PhoneNumber(fromNumber),
                    messageBody
            ).create();

            logger.info("Twilio SMS successfully sent to {}. Message SID: {}", normalizedPhone, message.getSid());
            return true; 
        } catch (Exception e) {
            logger.error("Twilio SMS failed to send to {}: {}", toPhoneNumber, e.getMessage());
            return false;
        }
    }
}
