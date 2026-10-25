package com.nakatay.backend.car;

import com.nakatay.backend.car.dto.CarListItemResponse;
import com.nakatay.backend.car.dto.CarModelDto;
import com.nakatay.backend.car.dto.CarTrimDto;
import com.nakatay.backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarServiceImpl implements CarService{
    private final CarRepository carRepository;

    @Override
    public CarModelDto getCarById(Long id) {
        CarModel car = carRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Автомобіль не знайдено"));

        if (car.isDeleted()) {
            throw new ResourceNotFoundException("Автомобіль не знайдено");
        }

        List<CarTrimDto> trims = car.getTrims().stream()
                .map(t -> new CarTrimDto(t.getTrimName(), t.getEngine(), t.getTransmission(), t.getYear(), t.getPriceModifier()))
                .toList();

        return new CarModelDto(
                car.getId(), car.getBrand(), car.getModelName(),
                car.getBasePrice(), car.getDescription(), car.getMainImageUrl(), trims
        );
    }

    @Override
    public List<CarListItemResponse> searchCars(String query) {
        List<CarModel> cars;
        if(query.isEmpty()){
            cars = carRepository.findAllByOrderByCreatedAtDesc();
        }
        else{
            cars = carRepository.findByBrandContainingIgnoreCaseOrModelNameContainingIgnoreCase(query, query);
        }

        return cars.stream()
                .filter(car -> !car.isDeleted())
                .map(car -> new CarListItemResponse(car.getId(), car.getBrand(), car.getModelName(), car.getBasePrice(), car.getMainImageUrl()))
                .toList();
    }
}
