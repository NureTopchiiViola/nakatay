package com.nakatay.backend.car;

import com.nakatay.backend.car.dto.CarListItemResponse;
import com.nakatay.backend.car.dto.CarModelDto;

import java.util.List;

public interface CarService {
    public CarModelDto getCarById(Long id);
    public List<CarListItemResponse> searchCars(String query);
}
