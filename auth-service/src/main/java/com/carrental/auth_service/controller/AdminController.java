package com.carrental.auth_service.controller;

import com.carrental.auth_service.entity.Car;
import com.carrental.auth_service.repository.CarRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/cars")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final CarRepository carRepository;

    public AdminController(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    @PostMapping
    public ResponseEntity<Car> addCar(@RequestBody Car car) {
        car.setAvailable(true);
        Car savedCar = carRepository.save(car);
        return new ResponseEntity<>(savedCar, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Car> updateCar(
            @PathVariable Long id,
            @RequestBody Car car) {

        Car existing = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        existing.setBrand(car.getBrand());
        existing.setModel(car.getModel());
        existing.setPricePerDay(car.getPricePerDay());
        existing.setAvailable(car.isAvailable());

        return ResponseEntity.ok(carRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCar(@PathVariable Long id) {

        if (!carRepository.existsById(id)) {
            throw new RuntimeException("Car not found");
        }

        carRepository.deleteById(id);
        return ResponseEntity.ok("Car deleted successfully");
    }
}
