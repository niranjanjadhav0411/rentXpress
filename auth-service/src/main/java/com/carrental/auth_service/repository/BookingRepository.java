package com.carrental.auth_service.repository;

import com.carrental.auth_service.entity.Booking;
import com.carrental.auth_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
}
