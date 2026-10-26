package com.nakatay.backend.car;

import com.nakatay.backend.car.dto.CarListItemResponse;
import com.nakatay.backend.car.dto.CarModelDto;
import com.nakatay.backend.car.dto.CarTrimDto;

import java.util.List;

public interface CarService {
    public CarTrimDto getCarById(Long id);
    public List<CarListItemResponse> searchCars(String query);
}
