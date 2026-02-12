package com.carrental.auth_service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequest {

    private Long carId;

    private LocalDate startDate;

    private LocalDate endDate;
}
