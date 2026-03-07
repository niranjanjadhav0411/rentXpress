package com.carrental.auth_service.controller;

import com.carrental.auth_service.entity.Notification;
import com.carrental.auth_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> getNotifications(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Unauthorized");
        }

        String email = authentication.name();

        return ResponseEntity.ok(
                notificationRepository
                        .findByRecipientEmailOrderByCreatedAtDesc(email)
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Unauthorized");
        }

        String email = authentication.name();

        long count =
                notificationRepository
                        .countByRecipientEmailAndReadStatusFalse(email);

        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification =
                notificationRepository.findById(id).orElseThrow();

        notification.setReadStatus(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok("Marked as read");
    }
}
