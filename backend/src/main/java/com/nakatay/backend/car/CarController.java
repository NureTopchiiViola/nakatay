package com.nakatay.backend.car;

import com.nakatay.backend.car.dto.CarListItemResponse;
import com.nakatay.backend.car.dto.CarModelDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {
    private final CarService carService;

    @GetMapping("/{id}")
    public CarModelDto getCar(@PathVariable Long id) {
        return carService.getCarById(id);
    }

    @GetMapping("/search")
    public List<CarListItemResponse> searchCars(@RequestParam(required = false) String query) {
        return carService.searchCars(((query != null) && !query.trim().isEmpty()) ? query : "");
    }

}
