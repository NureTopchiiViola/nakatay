package com.nakatay.backend.services;

import com.nakatay.backend.dto.request.CarFilterParams;
import com.nakatay.backend.dto.response.CarListItemResponse;
import com.nakatay.backend.dto.response.CarTrimDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CarService {
    public CarTrimDto getCarById(Long id);
    public Page<CarListItemResponse> searchCars(CarFilterParams filter, Pageable pageable);
}
