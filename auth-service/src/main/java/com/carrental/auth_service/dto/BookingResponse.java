package com.carrental.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;
    private String carName;
    private LocalDate startDate;
    private LocalDate endDate;
    private double totalPrice;
    private String status;
}
