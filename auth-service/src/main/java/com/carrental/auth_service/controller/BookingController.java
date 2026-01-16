package com.carrental.auth_service.controller;

import com.carrental.auth_service.dto.BookingRequest;
import com.carrental.auth_service.dto.BookingResponse;
import com.carrental.auth_service.entity.Booking;
import com.carrental.auth_service.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ================= CREATE BOOKING =================
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Unauthorized");
        }

        Booking booking = bookingService.createBooking(
                request,
                userDetails.getUsername()
        );

        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setCarId(booking.getCar().getId());
        response.setCarName(booking.getCar().getName());
        response.setStartDate(booking.getStartDate());
        response.setEndDate(booking.getEndDate());
        response.setTotalPrice(booking.getTotalPrice());
        response.setStatus(booking.getStatus().name());

        return ResponseEntity.ok(response);
    }

    // ================= GET LOGGED-IN USER BOOKINGS =================
    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Unauthorized");
        }

        List<Booking> bookings =
                bookingService.getUserBookings(userDetails.getUsername());

        return ResponseEntity.ok(bookings);
    }

    // ================= CANCEL BOOKING =================
    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Unauthorized");
        }

        bookingService.cancelBooking(id, userDetails.getUsername());

        return ResponseEntity.ok("Booking cancelled successfully");
    }
}
