package com.sgcs.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * Configures a shared RestTemplate bean with sensible timeouts.
 * Used by ComplaintService for AI service calls.
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate aiRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3_000);  // 3 s connect timeout
        factory.setReadTimeout(5_000);     // 5 s read timeout
        return new RestTemplate(factory);
    }
}
