package com.carrental.auth_service.events;

import com.carrental.auth_service.entity.Notification;
import com.carrental.auth_service.repository.NotificationRepository;
import com.carrental.auth_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    @EventListener
    public void handleBookingCreated(BookingCreatedEvent event) {

        String message = "New booking from " +
                event.getBooking().getUser().getEmail();

        Notification notification = Notification.builder()
                .recipientEmail("ADMIN")
                .message(message)
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
        notificationService.notifyAdmin(message);
    }

    @EventListener
    public void handleBookingApproved(BookingApprovedEvent event) {

        String email = event.getBooking().getUser().getEmail();
        String message = "Your booking has been CONFIRMED 🚗";

        Notification notification = Notification.builder()
                .recipientEmail(email)
                .message(message)
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
        notificationService.notifyUser(email, message);
    }

    @EventListener
    public void handleBookingRejected(BookingRejectedEvent event) {

        String email = event.getBooking().getUser().getEmail();
        String message = "Your booking was REJECTED ❌";

        Notification notification = Notification.builder()
                .recipientEmail(email)
                .message(message)
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
        notificationService.notifyUser(email, message);
    }
}
