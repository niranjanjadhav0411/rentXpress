package com.carrental.auth_service.controller;

import com.carrental.auth_service.dto.BookingResponse;
import com.carrental.auth_service.entity.Booking;
import com.carrental.auth_service.entity.BookingStatus;
import com.carrental.auth_service.repository.BookingRepository;
import com.carrental.auth_service.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;

    @GetMapping
    public ResponseEntity<Page<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "id")
        );

        Page<Booking> bookings = (status != null)
                ? bookingRepository.findByStatus(status, pageable)
                : bookingRepository.findAll(pageable);

        Page<BookingResponse> response = bookings.map(this::mapToResponse);

        return ResponseEntity.ok(response);
    }

    // APPROVE BOOKING

    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveBooking(@PathVariable Long id) {

        bookingService.updateBookingStatus(id, BookingStatus.CONFIRMED);
        return ResponseEntity.ok("Booking approved successfully");
    }


    // REJECT BOOKING

    @PutMapping("/{id}/reject")
    public ResponseEntity<String> rejectBooking(@PathVariable Long id) {

        bookingService.updateBookingStatus(id, BookingStatus.REJECTED);
        return ResponseEntity.ok("Booking rejected successfully");
    }


    // DASHBOARD STATISTICS (Optimized)

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {

        Double totalRevenue = bookingRepository.getTotalRevenue();
        long totalBookings = bookingRepository.count();
        long pending = bookingRepository.countByStatus(BookingStatus.PENDING);
        long confirmed = bookingRepository.countByStatus(BookingStatus.CONFIRMED);

        return ResponseEntity.ok(
                Map.of(
                        "totalRevenue", totalRevenue != null ? totalRevenue : 0.0,
                        "totalBookings", totalBookings,
                        "pending", pending,
                        "confirmed", confirmed
                )
        );
    }


    // DTO MAPPING

    private BookingResponse mapToResponse(Booking booking) {

        String carName = booking.getCar() != null
                ? booking.getCar().getBrand() + " " + booking.getCar().getModel()
                : "N/A";

        return new BookingResponse(
                booking.getId(),
                carName,
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getTotalPrice(),
                booking.getStatus().name()
        );
    }
}
