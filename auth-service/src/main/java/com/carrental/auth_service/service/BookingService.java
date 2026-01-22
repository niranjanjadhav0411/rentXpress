package com.carrental.auth_service.service;

import com.carrental.auth_service.dto.BookingRequest;
import com.carrental.auth_service.dto.BookingResponse;
import com.carrental.auth_service.entity.Booking;
import com.carrental.auth_service.entity.BookingStatus;
import com.carrental.auth_service.entity.Car;
import com.carrental.auth_service.entity.User;
import com.carrental.auth_service.repository.BookingRepository;
import com.carrental.auth_service.repository.CarRepository;
import com.carrental.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    /* ===================== CREATE BOOKING ===================== */
    public Booking createBooking(BookingRequest request, String userEmail) {

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        if (startDate.isAfter(endDate) || startDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Invalid booking dates");
        }

        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                car.getId(),
                startDate,
                endDate,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Car is already booked for selected dates");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double totalPrice = days * car.getPricePerDay();

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

    /* ===================== CONFIRM BOOKING (FIXED) ===================== */
    @Transactional
    public Booking confirmBooking(Long bookingId, String email) {

        Booking booking = bookingRepository
                .findByIdAndUser_Email(bookingId, email)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Booking cannot be confirmed");
        }

        booking.setStatus(BookingStatus.CONFIRMED);

        // ✅ CRITICAL FIX
        return bookingRepository.save(booking);
    }

    /* ===================== GET MY BOOKINGS ===================== */
    public List<BookingResponse> getUserBookings(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUser(user)
                .stream()
                .map(b -> new BookingResponse(
                        b.getId(),
                        b.getCar().getName(),
                        b.getStartDate(),
                        b.getEndDate(),
                        b.getTotalPrice(),
                        b.getStatus().name()
                ))
                .toList();
    }

    /* ===================== CANCEL BOOKING ===================== */
    public Booking cancelBooking(Long bookingId, String email) {

        Booking booking = bookingRepository
                .findByIdAndUser_Email(bookingId, email)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED ||
                booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    private BookingStatus status;
    public void updateBookingStatus(Long id, BookingStatus bookingStatus) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);
        bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}
