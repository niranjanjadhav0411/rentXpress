package com.carrental.auth_service.controller;

import com.carrental.auth_service.dto.BookingRequest;
import com.carrental.auth_service.entity.*;
import com.carrental.auth_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequest request,
            Authentication authentication
    ) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Unauthorized");
        }

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

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                car.getId(),
                startDate,
                endDate,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
        );

        if (!conflicts.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Car is already booked for the selected dates");
        }

        // 💰 Calculate total
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
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedBooking);
    }

    @GetMapping("/my")
    public ResponseEntity<?> myBookings(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Unauthorized");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> bookings = bookingRepository.findByUser(user);

        return ResponseEntity.ok(bookings);
    }
}
