package com.carrental.auth_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyAdmin(String message) {
        messagingTemplate.convertAndSend("/topic/admin", message);
    }

    public void notifyUser(String userEmail, String message) {
        messagingTemplate.convertAndSend("/topic/user/" + userEmail, message);
    }
}
