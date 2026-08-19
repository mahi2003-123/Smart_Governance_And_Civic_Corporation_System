package com.sgcs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SgcsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SgcsApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🚀 SGCS Spring Boot Backend Running on Port 5000");
        System.out.println("=================================================");
    }
}
