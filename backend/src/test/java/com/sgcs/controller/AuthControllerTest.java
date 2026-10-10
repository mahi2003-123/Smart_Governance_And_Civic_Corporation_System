package com.sgcs.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sgcs.dto.AuthDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Automatically rolls back database writes without polluting PostgreSQL
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testValidRegistration() throws Exception {
        // Arrange proper DTO based closely on the actual expected fields
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setFullName("John Doe");
        request.setEmail("john.doe.integration.test@example.com"); // uniqueness constraint safe
        request.setPassword("SecurePass1!");
        request.setRole("CITIZEN");
        request.setPhone("9876543210");
        request.setWard("Ward 2 - South");

        // Act & Assert natively against the DB and full MVC stack
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("CITIZEN"));
    }

    @Test
    public void testInvalidRegistrationMissingFields() throws Exception {
        // Arrange
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setEmail("john@example.com"); // Missing password and name

        // Act & Assert validation errors correctly trigger HTTP 400 Bad Request
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
