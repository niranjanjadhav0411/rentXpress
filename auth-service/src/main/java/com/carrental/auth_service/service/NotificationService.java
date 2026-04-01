package com.carrental.auth_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyAdmin(String message) {
        System.out.println("Sending to ADMIN: " + message);
        messagingTemplate.convertAndSend("/topic/admin", message);
    }

    public void notifyUser(String email, String message) {
        System.out.println("Sending to USER: " + email);
        messagingTemplate.convertAndSend("/topic/user/" + email, message);
    }
}
