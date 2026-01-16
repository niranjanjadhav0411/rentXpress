package com.carrental.auth_service.controller;

import com.carrental.auth_service.dto.BookingResponse;
import com.carrental.auth_service.entity.BookingStatus;
import com.carrental.auth_service.repository.BookingRepository;
import com.carrental.auth_service.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingRepository bookingRepository;
    private BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {

        List<BookingResponse> responses = bookingRepository.findAll()
                .stream()
                .map(b -> {
                    BookingResponse r = new BookingResponse();
                    r.setId(b.getId());
                    r.setCarName(b.getCar().getName());
                    r.setStartDate(b.getStartDate());
                    r.setEndDate(b.getEndDate());
                    r.setTotalPrice(b.getTotalPrice());
                    r.setStatus(b.getStatus().name());
                    return r;
                }).toList();

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveBooking(@PathVariable Long id) {
        bookingService.updateBookingStatus(id, BookingStatus.CONFIRMED);
        return ResponseEntity.ok("Booking approved");
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<String> rejectBooking(@PathVariable Long id) {
        bookingService.updateBookingStatus(id, BookingStatus.REJECTED);
        return ResponseEntity.ok("Booking rejected");
    }

}
