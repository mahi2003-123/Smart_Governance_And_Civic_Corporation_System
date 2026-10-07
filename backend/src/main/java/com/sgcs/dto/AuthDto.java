package com.sgcs.dto;

import com.sgcs.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Phone number is required")
        private String phone;

        private String role = "CITIZEN";

        @NotBlank(message = "Ward selection is required")
        private String ward;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getWard() { return ward; }
        public void setWard(String ward) { this.ward = ward; }
    }

    public static class UpdateProfileRequest {
        private String fullName;
        private String phone;
        private String ward;
        private String address;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getWard() { return ward; }
        public void setWard(String ward) { this.ward = ward; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
    }

    public static class AuthResponse {
        private boolean success;
        private User user;
        private String token;

        public AuthResponse(boolean success, User user, String token) {
            this.success = success;
            this.user = user;
            this.token = token;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public User getUser() { return user; }
        public void setUser(User user) { this.user = user; }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}
