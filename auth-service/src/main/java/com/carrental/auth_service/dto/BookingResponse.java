package com.carrental.auth_service.dto;

import java.time.LocalDate;

public class BookingResponse {

    private Long id;
    private String carName;
    private LocalDate startDate;
    private LocalDate endDate;
    private double totalPrice;
    private String status;

    public BookingResponse() {}

    public BookingResponse(
            Long id,
            String carName,
            LocalDate startDate,
            LocalDate endDate,
            double totalPrice,
            String status
    ) {
        this.id = id;
        this.carName = carName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalPrice = totalPrice;
        this.status = status;
    }

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCarName() { return carName; }
    public void setCarName(String carName) { this.carName = carName; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
