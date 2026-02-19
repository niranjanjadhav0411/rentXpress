package com.carrental.auth_service.controller;

import com.carrental.auth_service.entity.Car;
import com.carrental.auth_service.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@RestController
@RequestMapping("/api/admin/cars")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminCarController {

    private final CarRepository carRepository;

    // ================= ADD CAR =================
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Car> addCar(
            @RequestParam String brand,
            @RequestParam String model,
            @RequestParam Double pricePerDay,
            @RequestParam(defaultValue = "true") Boolean available,
            @RequestParam(required = false) MultipartFile image
    ) throws IOException {

        Car car = new Car();
        car.setBrand(brand);
        car.setModel(model);
        car.setPricePerDay(pricePerDay);
        car.setAvailable(available);

        if (image != null && !image.isEmpty()) {
            car.setImage(convertToBase64(image));
        }

        Car savedCar = carRepository.save(car);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCar);
    }

    // ================= UPDATE CAR =================
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<Car> updateCar(
            @PathVariable Long id,
            @RequestParam String brand,
            @RequestParam String model,
            @RequestParam Double pricePerDay,
            @RequestParam(defaultValue = "true") Boolean available,
            @RequestParam(required = false) MultipartFile image
    ) throws IOException {

        return carRepository.findById(id)
                .map(existingCar -> {

                    existingCar.setBrand(brand);
                    existingCar.setModel(model);
                    existingCar.setPricePerDay(pricePerDay);
                    existingCar.setAvailable(available);

                    try {
                        if (image != null && !image.isEmpty()) {
                            existingCar.setImage(convertToBase64(image));
                        }
                    } catch (IOException e) {
                        throw new RuntimeException("Image upload failed");
                    }

                    Car updatedCar = carRepository.save(existingCar);
                    return ResponseEntity.ok(updatedCar);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ================= DELETE CAR =================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable Long id) {

        if (!carRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        carRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ================= HELPER =================
    private String convertToBase64(MultipartFile file) throws IOException {
        return "data:" + file.getContentType() + ";base64," +
                Base64.getEncoder().encodeToString(file.getBytes());
    }
}
