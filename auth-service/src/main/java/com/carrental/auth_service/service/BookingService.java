package com.carrental.auth_service.service;

import com.carrental.auth_service.dto.BookingRequest;
import com.carrental.auth_service.entity.Booking;
import com.carrental.auth_service.entity.BookingStatus;
import com.carrental.auth_service.entity.Car;
import com.carrental.auth_service.entity.User;
import com.carrental.auth_service.repository.BookingRepository;
import com.carrental.auth_service.repository.CarRepository;
import com.carrental.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    // ================= CREATE BOOKING =================
    public Booking createBooking(
            BookingRequest request,
            String userEmail
    ) {

        //  Validate dates
        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        if (startDate.isAfter(endDate) || startDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Invalid booking dates");
        }

        //  Get car
        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        //  Check booking conflicts
        List<Booking> conflicts =
                bookingRepository.findConflictingBookings(
                        car.getId(),
                        startDate,
                        endDate,
                        List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
                );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Car is already booked for selected dates");
        }

        //  Get user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //  Calculate days & price
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double totalPrice = days * car.getPricePerDay();

        //  Create booking
        Booking booking = new Booking();
        booking.setCar(car);
        booking.setUser(user);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setTotalDays((int) days);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    // ================= GET USER BOOKINGS =================
    public List<Booking> getUserBookings(String username) {

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUser(user);
    }

    // ================= CANCEL BOOKING =================
    public Booking cancelBooking(Long bookingId, String email) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Only owner can cancel
        if (!booking.getUser().getEmail().equals(email)) {
            throw new RuntimeException("You can cancel only your own bookings");
        }

        // Cannot cancel completed or already cancelled bookings
        if (booking.getStatus() == BookingStatus.CANCELLED ||
                booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    // Booking Status
    public Booking updateBookingStatus(Long bookingId, BookingStatus status) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be updated");
        }

        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}
