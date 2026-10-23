package com.sgcs.config;

import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.TimeZone;

@Configuration
public class JacksonConfig {

    private static final DateTimeFormatter ISO_ZONED = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
        return builder -> {
            builder.timeZone(TimeZone.getTimeZone("UTC"));
            builder.simpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
            builder.serializerByType(LocalDateTime.class, new LocalDateTimeSerializer(ISO_ZONED));
        };
    }
}
