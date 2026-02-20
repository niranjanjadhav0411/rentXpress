package com.carrental.auth_service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequest {

    private Long carId;

    private LocalDate startDate;

    private LocalDate endDate;

    private String name;
    private String email;
    private String contact;
    private String location;
    private String destination;
    private String pickupAddress;
    private Integer totalDays;


}
