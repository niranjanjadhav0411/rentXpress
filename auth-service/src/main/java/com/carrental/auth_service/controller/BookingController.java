package com.carrental.auth_service.controller;

import com.carrental.auth_service.dto.BookingRequest;
import com.carrental.auth_service.entity.Booking;
import com.carrental.auth_service.entity.Car;
import com.carrental.auth_service.entity.User;
import com.carrental.auth_service.repository.BookingRepository;
import com.carrental.auth_service.repository.CarRepository;
import com.carrental.auth_service.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    public BookingController(
            BookingRepository bookingRepository,
            CarRepository carRepository,
            UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
    }

    // ✅ CREATE BOOKING
    @PostMapping
    public Booking createBooking(
            @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            throw new RuntimeException("Unauthorized");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        if (startDate.isAfter(endDate) || startDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Invalid booking dates");
        }

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double totalPrice = totalDays * car.getPricePerDay();

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCar(car);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setTotalDays((int) totalDays);
        booking.setTotalPrice(totalPrice);
        booking.setStatus("CONFIRMED");

        return bookingRepository.save(booking);
    }

    // ✅ GET LOGGED-IN USER BOOKINGS
    @GetMapping("/my")
    public List<Booking> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            throw new RuntimeException("Unauthorized");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUser(user);
    }
}
