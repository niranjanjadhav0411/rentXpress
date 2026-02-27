package com.carrental.auth_service.controller;

import com.carrental.auth_service.dto.BookingRequest;
import com.carrental.auth_service.dto.Revenue;
import com.carrental.auth_service.entity.*;
import com.carrental.auth_service.repository.*;
import com.carrental.auth_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final NotificationService notificationService;

    // ================= CREATE BOOKING =================
    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequest request,
            Authentication authentication
    ) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        User user = (User) authentication.getPrincipal();

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        if (startDate == null || endDate == null) {
            return ResponseEntity.badRequest()
                    .body("Start date and end date are required");
        }

        if (endDate.isBefore(startDate)) {
            return ResponseEntity.badRequest()
                    .body("End date cannot be before start date");
        }

        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() ->
                        new RuntimeException("Car not found"));

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                car.getId(),
                startDate,
                endDate,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
        );

        notificationService.notifyAdmin(
                "New booking from " + user.getEmail()
        );

        if (!conflicts.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Car is already booked for the selected dates");
        }

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double totalPrice = totalDays * car.getPricePerDay();

        Booking booking = Booking.builder()
                .car(car)
                .user(user)
                .startDate(startDate)
                .endDate(endDate)
                .totalDays((int) totalDays)
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)

                .name(request.getName())
                .email(request.getEmail())
                .contact(request.getContact())
                .location(request.getLocation())
                .destination(request.getDestination())
                .pickupAddress(request.getPickupAddress())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingRepository.save(booking));
    }

    // ================= MY BOOKINGS =================
    @GetMapping("/my")
    public ResponseEntity<?> myBookings(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(bookingRepository.findByUser(user));
    }

    // ================= CANCEL BOOKING =================
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        // Check ownership
        if (!booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You cannot cancel this booking");
        }
        
        // User can ONLY cancel PENDING bookings
        if (booking.getStatus() != BookingStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body("You can only cancel pending bookings");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        return ResponseEntity.ok("Booking cancelled successfully");
    }

    // ================= ADMIN - GET ALL BOOKINGS =================
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<?> getAllBookingsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("id").descending()
        );

        Page<Booking> bookingPage = bookingRepository.findAll(pageable);

        return ResponseEntity.ok(
                Map.of(
                        "content", bookingPage.getContent(),
                        "totalElements", bookingPage.getTotalElements(),
                        "totalPages", bookingPage.getTotalPages(),
                        "currentPage", bookingPage.getNumber()
                )
        );
    }

    // ================= ADMIN - APPROVE =================
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body("Only pending bookings can be approved");
        }

        notificationService.notifyUser(
                booking.getUser().getEmail(),
                "Your booking has been CONFIRMED"
        );

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return ResponseEntity.ok("Booking approved successfully");
    }

    // ================= ADMIN - REJECT =================
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body("Only pending bookings can be rejected");
        }

        notificationService.notifyUser(
                booking.getUser().getEmail(),
                "Your booking was REJECTED"
        );

        booking.setStatus(BookingStatus.REJECTED);
        bookingRepository.save(booking);

        return ResponseEntity.ok("Booking rejected successfully");
    }

    // ================= ADMIN - STATS =================
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getAdminStats() {

        List<Booking> bookings = bookingRepository.findAll();

        long totalBookings = bookings.size();

        long pending = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING)
                .count();

        long confirmed = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .count();

        double totalRevenue = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .mapToDouble(Booking::getTotalPrice)
                .sum();

        return ResponseEntity.ok(
                Map.of(
                        "totalBookings", totalBookings,
                        "pending", pending,
                        "confirmed", confirmed,
                        "totalRevenue", totalRevenue
                )
        );
    }

    // ================= ADMIN - REVENUE =================
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/revenue")
    public ResponseEntity<?> getRevenueData() {

        List<Booking> bookings = bookingRepository.findAll();

        Map<String, Double> revenueByMonth = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .collect(Collectors.groupingBy(
                        b -> b.getStartDate().getMonth().toString(),
                        Collectors.summingDouble(Booking::getTotalPrice)
                ));

        List<Revenue> result = revenueByMonth.entrySet()
                .stream()
                .map(entry -> new Revenue(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
