package com.carrental.auth_service.controller;

import com.carrental.auth_service.entity.Notification;
import com.carrental.auth_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    // ================= GET ALL NOTIFICATIONS =================
    @GetMapping
    public ResponseEntity<?> getNotifications(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = authentication.getName();

        return ResponseEntity.ok(
                notificationRepository
                        .findByRecipientEmailOrderByCreatedAtDesc(email)
        );
    }

    // ================= GET UNREAD COUNT =================
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = authentication.getName();

        long count =
                notificationRepository
                        .countByRecipientEmailAndReadStatusFalse(email);

        return ResponseEntity.ok(count);
    }

    // ================= MARK AS READ =================
//    @PutMapping("/{id}/read")
//    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
//
//        Notification notification =
//                notificationRepository.findById(id)
//                        .orElseThrow(() -> new RuntimeException("Notification not found"));
//
//        notification.setReadStatus(true);
//
//        notificationRepository.save(notification);
//
//        return ResponseEntity.ok("Marked as read");
    }
}
