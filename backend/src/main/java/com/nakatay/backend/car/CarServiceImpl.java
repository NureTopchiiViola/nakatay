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
    public List<CarListItemResponse> searchCars(String query) {
        List<CarTrim> trims;
        if(query.isEmpty()){
            trims = carTrimRepository.findAllDefault();
        }
        else{
            trims = carTrimRepository.searchByQuery(query);
        }

        return trims.stream()
                .filter(trim -> !trim.getCarModel().isDeleted() && trim.isAvailable())
                .map(trim -> new CarListItemResponse(
                        trim.getId(),
                        trim.getCarModel().getBrand() + " " + trim.getCarModel().getModelName() + " " + trim.getTrimName(),
                        trim.getYear(),
                        trim.getEngine(),
                        trim.getTransmission(),
                        trim.getCarModel().getBasePrice().add(trim.getPriceModifier()),
                        trim.getCarModel().getMainImageUrl()
                ))
                .toList();
    }
}
