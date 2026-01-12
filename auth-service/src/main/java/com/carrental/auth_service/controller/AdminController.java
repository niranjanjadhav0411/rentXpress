package com.carrental.auth_service.controller;

import com.carrental.auth_service.entity.Car;
import com.carrental.auth_service.repository.CarRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/cars")
public class AdminController {

    private final CarRepository carRepository;

    public AdminController(CarRepository carRepository){
        this.carRepository = carRepository;
    }

    @PostMapping
    public Car addCar(@RequestBody Car car) {
        car.setAvailable(true);
        return carRepository.save(car);
    }

    @PutMapping("/{id}")
    public Car updateCar(@PathVariable Long id, @RequestBody Car car) {

        Car existing = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        existing.setBrand(car.getBrand());
        existing.setModel(car.getModel());
        existing.setPricePerDay(car.getPricePerDay());

        return carRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteCar(@PathVariable Long id) {
        carRepository.deleteById(id);
        return "Car deleted";
    }
}
