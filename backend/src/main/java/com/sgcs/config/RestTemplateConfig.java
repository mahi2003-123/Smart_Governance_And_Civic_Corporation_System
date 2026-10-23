package com.sgcs.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * Configures a shared RestTemplate bean with sensible timeouts and AI internal auth.
 * Used by ComplaintService for AI service calls.
 */
@Configuration
public class RestTemplateConfig {

    @Value("${ai.internal.key:}")
    private String aiInternalKey;

    @Bean
    public RestTemplate aiRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3_000);  // 3 s connect timeout
        factory.setReadTimeout(5_000);     // 5 s read timeout
        RestTemplate restTemplate = new RestTemplate(factory);
        if (aiInternalKey != null && !aiInternalKey.trim().isEmpty()) {
            final String key = aiInternalKey.trim();
            restTemplate.getInterceptors().add((request, body, execution) -> {
                request.getHeaders().set("X-Internal-Key", key);
                return execution.execute(request, body);
            });
        }
        return restTemplate;
    }
}
