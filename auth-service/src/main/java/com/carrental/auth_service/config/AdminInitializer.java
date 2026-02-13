package com.carrental.auth_service.config;

import com.carrental.auth_service.service.AuthService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer {

    private final AuthService authService;

    @PostConstruct
    public void init() {
        try {
            authService.createAdminIfNotExists();
        } catch (Exception e) {
            System.err.println("Failed to create default admin: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
