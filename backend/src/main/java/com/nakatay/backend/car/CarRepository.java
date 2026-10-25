package com.nakatay.backend.car;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<CarModel, Long> {
    List<CarModel> findByBrandContainingIgnoreCaseOrModelNameContainingIgnoreCase(String brand, String model);
    List<CarModel> findAllByOrderByCreatedAtDesc();
}