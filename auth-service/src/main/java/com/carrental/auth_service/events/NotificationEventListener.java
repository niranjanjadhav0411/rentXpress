package com.carrental.auth_service.events;

import com.carrental.auth_service.entity.Booking;
import com.carrental.auth_service.entity.Notification;
import com.carrental.auth_service.repository.NotificationRepository;
import com.carrental.auth_service.service.EmailService;
import com.carrental.auth_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final NotificationService    notificationService;
    private final EmailService           emailService;

    // ── Booking Created → notify admin + send "Received" email to user ──
    @EventListener
    public void handleBookingCreated(BookingCreatedEvent event) {
        Booking booking = event.getBooking();
        String  adminMsg = "New booking #" + booking.getId() + " from " + booking.getUser().getEmail()
                + " for " + booking.getCar().getBrand() + " " + booking.getCar().getModel();

        saveNotification("ADMIN", adminMsg);
        notificationService.notifyAdmin(adminMsg);

        // Send "Booking Received" confirmation email to user
        emailService.sendBookingReceivedEmail(booking);
        log.info("BookingCreated event processed for booking #{}", booking.getId());
    }

    // ── Booking Approved → notify user + send confirmed email with PDF ──
    @EventListener
    public void handleBookingApproved(BookingApprovedEvent event) {
        Booking booking = event.getBooking();
        String  email   = booking.getUser().getEmail();
        String  msg     = "Your booking #" + booking.getId() + " for "
                + booking.getCar().getBrand() + " " + booking.getCar().getModel()
                + " has been CONFIRMED!";

        saveNotification(email, msg);
        notificationService.notifyUser(email, msg);

        // Send confirmation email with PDF receipt attached
        emailService.sendBookingConfirmedEmail(booking);
        log.info("BookingApproved event processed for booking #{}", booking.getId());
    }

    // ── Booking Rejected → notify user + send rejection email
    @EventListener
    public void handleBookingRejected(BookingRejectedEvent event) {
        Booking booking = event.getBooking();
        String  email   = booking.getUser().getEmail();
        String  msg     = "Your booking #" + booking.getId() + " for "
                + booking.getCar().getBrand() + " " + booking.getCar().getModel()
                + " was not confirmed. Please contact support.";

        saveNotification(email, msg);
        notificationService.notifyUser(email, msg);

        // Send rejection email
        emailService.sendBookingRejectedEmail(booking);
        log.info("BookingRejected event processed for booking #{}", booking.getId());
    }

    // ── Helper
//    private void saveNotification(String recipient, String message) {
//        notificationRepository.save(
//                Notification.builder()
//                        .recipientEmail(recipient)
//                        .message(message)
//                        .readStatus(false)
//                        .createdAt(LocalDateTime.now())
//                        .build()
//        );
    }
}
