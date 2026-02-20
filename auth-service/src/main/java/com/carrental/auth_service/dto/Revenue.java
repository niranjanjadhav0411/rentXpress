package com.carrental.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Revenue {
    private String month;
    private Double revenue;
}
