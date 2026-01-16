package com.carrental.auth_service.repository;

import com.carrental.auth_service.entity.Booking;
import com.carrental.auth_service.entity.BookingStatus;
import com.carrental.auth_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);

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
}
