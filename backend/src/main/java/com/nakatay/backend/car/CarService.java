package com.nakatay.backend.car;

import com.nakatay.backend.car.dto.CarFilterParams;
import com.nakatay.backend.car.dto.CarListItemResponse;
import com.nakatay.backend.car.dto.CarTrimDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CarService {
    public CarTrimDto getCarById(Long id);
    public Page<CarListItemResponse> searchCars(CarFilterParams filter, Pageable pageable);
}
