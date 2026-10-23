package com.sgcs.security;

import com.sgcs.exception.TooManyRequestsException;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long WINDOW_MS = 15 * 60 * 1000L; // 15 minutes

    private final ConcurrentHashMap<String, List<Long>> attempts = new ConcurrentHashMap<>();

    private String buildKey(String email, String ip) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        String cleanIp = ip != null ? ip.trim() : "unknown";
        return cleanEmail + ":" + cleanIp;
    }

    public void checkRateLimit(String email, String ip) {
        String key = buildKey(email, ip);
        long now = System.currentTimeMillis();
        List<Long> timestamps = attempts.get(key);
        if (timestamps != null) {
            synchronized (timestamps) {
                timestamps.removeIf(t -> now - t > WINDOW_MS);
                if (timestamps.size() >= MAX_FAILED_ATTEMPTS) {
                    throw new TooManyRequestsException("Too many failed login attempts. Please try again in 15 minutes.");
                }
            }
        }
    }

    public void recordFailedAttempt(String email, String ip) {
        String key = buildKey(email, ip);
        long now = System.currentTimeMillis();
        attempts.compute(key, (k, list) -> {
            if (list == null) {
                list = Collections.synchronizedList(new ArrayList<>());
            }
            list.add(now);
            list.removeIf(t -> now - t > WINDOW_MS);
            return list;
        });
    }

    public void clear(String email, String ip) {
        attempts.remove(buildKey(email, ip));
    }
}
