package com.carrental.auth_service.repository;

import com.carrental.auth_service.entity.Booking;
import com.carrental.auth_service.entity.BookingStatus;
import com.carrental.auth_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser(User user);

    Optional<Booking> findByIdAndUser_Email(Long id, String email);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.car.id = :carId
          AND b.status IN :statuses
          AND (:startDate <= b.endDate AND :endDate >= b.startDate)
    """)
    List<Booking> findConflictingBookings(
            @Param("carId") Long carId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") List<BookingStatus> statuses
    );


    // Total revenue from confirmed bookings
    @Query("SELECT COUNT(b) FROM Booking b")
    long countTotal();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'PENDING'")
    long countPending();

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.status = 'CONFIRMED'")
    Double getTotalRevenue();

    // Count bookings by status
    Long countByStatus(BookingStatus status);
    
}
