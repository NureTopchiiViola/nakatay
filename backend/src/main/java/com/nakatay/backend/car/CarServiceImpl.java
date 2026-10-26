package com.nakatay.backend.car;

import com.nakatay.backend.car.dto.CarFilterParams;
import com.nakatay.backend.car.dto.CarListItemResponse;
import com.nakatay.backend.car.dto.CarTrimDto;
import com.nakatay.backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CarServiceImpl implements CarService{
    private final CarTrimRepository carTrimRepository;

    @Override
    public CarTrimDto getCarById(Long trimId) {
        CarTrim trim = carTrimRepository.findByIdWithModel(trimId).orElseThrow(() -> new ResourceNotFoundException("Комплектацію не знайдено"));

        if (trim.getCarModel().isDeleted() || !trim.isAvailable()) {
            throw new ResourceNotFoundException("Автомобіль недоступний");
        }

        return new CarTrimDto(
                trim.getId(),
                trim.getCarModel().getBrand(),
                trim.getCarModel().getModelName(),
                trim.getTrimName(),
                trim.getYear(),
                trim.getEngine(),
                trim.getTransmission(),
                trim.getCarModel().getBodyType(),
                trim.getCarModel().getBasePrice().add(trim.getPriceModifier()),
                trim.getGalleryUrls()
        );
    }

    @Override
    public Page<CarListItemResponse> searchCars(CarFilterParams filter, Pageable pageable) {
        Page<CarTrim> trimPage = carTrimRepository.findAll(CarSearchSpecifications.withFilters(filter), pageable);

        return trimPage.map(trim -> new CarListItemResponse(
                trim.getId(),
                trim.getCarModel().getBrand() + " " + trim.getCarModel().getModelName() + " " + trim.getTrimName(),
                trim.getYear(),
                trim.getEngine(),
                trim.getTransmission(),
                trim.getCarModel().getBasePrice().add(trim.getPriceModifier()),
                trim.getCarModel().getMainImageUrl()
        ));
    }
}
