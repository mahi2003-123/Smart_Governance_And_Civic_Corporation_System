package com.sgcs.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CreateUserRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    private String phone;

    @NotBlank(message = "Role is required")
    private String role; // CITIZEN, COUNCILLOR, WORKER

    @NotBlank(message = "Ward is required")
    private String ward;

    private String specialization;

    private String password;

    public CreateUserRequest() {}

    public CreateUserRequest(String fullName, String email, String phone, String role, String ward, String specialization, String password) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.ward = ward;
        this.specialization = specialization;
        this.password = password;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
