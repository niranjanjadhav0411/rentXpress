package com.carrental.auth_service.dto;

public class AuthResponse {

    private String accessToken;
    private String email;
    private String role;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String email, String role) {
        this.accessToken = accessToken;
        this.email = email;
        this.role = role;
    }

    // GETTERS & SETTERS
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
