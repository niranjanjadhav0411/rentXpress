package com.carrental.auth_service.service;

import com.carrental.auth_service.dto.BookingRequest;
import com.carrental.auth_service.dto.BookingResponse;
import com.carrental.auth_service.entity.*;
import com.carrental.auth_service.events.BookingApprovedEvent;
import com.carrental.auth_service.events.BookingCreatedEvent;
import com.carrental.auth_service.events.BookingRejectedEvent;
import com.carrental.auth_service.repository.BookingRepository;
import com.carrental.auth_service.repository.CarRepository;
import com.carrental.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    // ── CREATE BOOKING
    public Booking createBooking(BookingRequest request, String userEmail) {

        LocalDate startDate = request.getStartDate();
        LocalDate endDate   = request.getEndDate();

        if (startDate == null || endDate == null)
            throw new RuntimeException("Start and end dates are required");
        if (startDate.isAfter(endDate))
            throw new RuntimeException("End date cannot be before start date");
        if (startDate.isBefore(LocalDate.now()))
            throw new RuntimeException("Start date cannot be in the past");

        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                car.getId(), startDate, endDate,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED));

        if (!conflicts.isEmpty())
            throw new RuntimeException("Car already booked for selected dates");

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long days        = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double totalPrice = days * car.getPricePerDay();

        Booking booking = Booking.builder()
                .car(car)
                .user(user)
                .startDate(startDate)
                .endDate(endDate)
                .totalDays((int) days)
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .name(request.getName())
                .email(request.getEmail())
                .contact(request.getContact())
                .location(request.getLocation())
                .destination(request.getDestination())
                .pickupAddress(request.getPickupAddress())
                .fuelPreference(request.getFuelPreference())
                .paymentMethod(request.getPaymentMethod())
                .txnId(request.getTxnId())
                .build();

        Booking saved = bookingRepository.save(booking);

        // Fire event → sends "Booking Received" email to user + notifies admin
        eventPublisher.publishEvent(new BookingCreatedEvent(saved));

        return saved;
    }

    // ── USER BOOKINGS
    public List<BookingResponse> getUserBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUser(user).stream()
                .map(b -> new BookingResponse(
                        b.getId(),
                        b.getCar().getBrand() + " " + b.getCar().getModel(),
                        b.getStartDate(),
                        b.getEndDate(),
                        b.getTotalPrice(),
                        b.getStatus().name()))
                .toList();
    }

    // ── USER CANCEL
    @Transactional
    public Booking cancelBooking(Long bookingId, String email) {
        Booking booking = bookingRepository.findByIdAndUser_Email(bookingId, email)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CONFIRMED)
            throw new RuntimeException("Confirmed booking cannot be cancelled");

        booking.setStatus(BookingStatus.CANCELLED);
        booking.getCar().setAvailable(true);
        return booking;
    }

    // ── ADMIN
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Transactional
    public void updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING)
            throw new RuntimeException("Only pending bookings can be updated");

        if (status == BookingStatus.CONFIRMED) {
            List<Booking> conflicts = bookingRepository.findConflictingBookings(
                    booking.getCar().getId(),
                    booking.getStartDate(),
                    booking.getEndDate(),
                    List.of(BookingStatus.CONFIRMED));
            if (!conflicts.isEmpty())
                throw new RuntimeException("Car already confirmed for these dates");

            booking.getCar().setAvailable(false);
        }

        if (status == BookingStatus.REJECTED || status == BookingStatus.CANCELLED)
            booking.getCar().setAvailable(true);

        booking.setStatus(status);

        // Fire event → sends email to user
        if (status == BookingStatus.CONFIRMED)
            eventPublisher.publishEvent(new BookingApprovedEvent(booking));
        else if (status == BookingStatus.REJECTED)
            eventPublisher.publishEvent(new BookingRejectedEvent(booking));
    }
}
