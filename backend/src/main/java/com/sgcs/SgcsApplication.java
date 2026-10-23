package com.sgcs;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SgcsApplication {

    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }

    public static void main(String[] args) {
        SpringApplication.run(SgcsApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🚀 SGCS Spring Boot Backend Running on Port 5000");
        System.out.println("=================================================");
    }
}
