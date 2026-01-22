package com.carrental.auth_service.controller;

import com.carrental.auth_service.dto.BookingResponse;
import com.carrental.auth_service.entity.Booking;
import com.carrental.auth_service.entity.BookingStatus;
import com.carrental.auth_service.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;

    // ✅ GET ALL BOOKINGS
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {

        List<BookingResponse> responses = bookingService.getAllBookings()
                .stream()
                .map(this::mapToResponse)
                .toList();

        return ResponseEntity.ok(responses);
    }

    // ✅ APPROVE
    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveBooking(@PathVariable Long id) {
        bookingService.updateBookingStatus(id, BookingStatus.CONFIRMED);
        return ResponseEntity.ok("Booking approved");
    }

    // ✅ REJECT
    @PutMapping("/{id}/reject")
    public ResponseEntity<String> rejectBooking(@PathVariable Long id) {
        bookingService.updateBookingStatus(id, BookingStatus.REJECTED);
        return ResponseEntity.ok("Booking rejected");
    }

    // 🔁 SAFE MAPPER
    private BookingResponse mapToResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setStartDate(b.getStartDate());
        r.setEndDate(b.getEndDate());
        r.setTotalPrice(b.getTotalPrice());
        r.setStatus(b.getStatus().name());

        if (b.getCar() != null) {
            r.setCarName(b.getCar().getBrand() + " " + b.getCar().getModel());
        }

        return r;
    }
}
