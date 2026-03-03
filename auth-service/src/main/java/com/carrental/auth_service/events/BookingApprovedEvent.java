package com.carrental.auth_service.events;

import com.carrental.auth_service.entity.Booking;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class BookingApprovedEvent {
    private final Booking booking;
}
