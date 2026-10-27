package com.nakatay.backend.option;

import com.nakatay.backend.car.CarTrim;
import com.nakatay.backend.car.CarTrimRepository;
import com.nakatay.backend.option.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OptionService {
    private final OptionRepository optionRepository;
    private final ConfigRepository savedConfigRepository;
    private final CarTrimRepository carTrimRepository;


    public List<OptionDto> getOptionsForTrim(Long trimId) {
        return optionRepository.findByCarTrimIdAndIsAvailableTrue(trimId).stream()
                .map(this::mapToOptionDto)
                .toList();
    }

    public PriceResponse calculatePrice(PriceRequest request) {
        CarTrim trim = carTrimRepository.findById(request.carTrimId())
                .orElseThrow(() -> new IllegalArgumentException("Комплектацію не знайдено: " + request.carTrimId()));

        BigDecimal basePrice = trim.getCarModel().getBasePrice()
                .add(trim.getPriceModifier() != null ? trim.getPriceModifier() : BigDecimal.ZERO);

        List<Option> options = request.selectedOptionIds() != null && !request.selectedOptionIds().isEmpty()
                ? optionRepository.findAllById(request.selectedOptionIds())
                : Collections.emptyList();

        BigDecimal optionsCost = options.stream()
                .map(Option::getPriceModifier)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal totalPrice = basePrice.add(optionsCost).subtract(discount);

        return new PriceResponse(basePrice, optionsCost, discount, totalPrice);
    }

    public ConfigResponse saveConfiguration(ConfigRequest request) {
        CarTrim trim = carTrimRepository.findById(request.carTrimId())
                .orElseThrow(() -> new IllegalArgumentException("Комплектацію не знайдено: " + request.carTrimId()));

        List<Option> options = request.selectedOptionIds() != null && !request.selectedOptionIds().isEmpty()
                ? optionRepository.findAllById(request.selectedOptionIds())
                : Collections.emptyList();

        BigDecimal basePrice = trim.getCarModel().getBasePrice()
                .add(trim.getPriceModifier() != null ? trim.getPriceModifier() : BigDecimal.ZERO);
        BigDecimal optionsCost = options.stream()
                .map(Option::getPriceModifier)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPrice = basePrice.add(optionsCost);
        String shareCode = generateUniqueShareCode();

        SavedConfig savedConfig = SavedConfig.builder()
                .userId(request.userId())
                .carTrim(trim)
                .shareCode(shareCode)
                .totalPrice(totalPrice)
                .selectedOptions(new HashSet<>(options))
                .build();

        SavedConfig saved = savedConfigRepository.save(savedConfig);
        return mapToSavedConfigResponse(saved, basePrice);
    }

    public ConfigResponse getByShareCode(String shareCode) {
        SavedConfig config = savedConfigRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new IllegalArgumentException("Конфігурацію за кодом не знайдено: " + shareCode));

        CarTrim trim = config.getCarTrim();
        BigDecimal basePrice = trim.getCarModel().getBasePrice()
                .add(trim.getPriceModifier() != null ? trim.getPriceModifier() : BigDecimal.ZERO);

        return mapToSavedConfigResponse(config, basePrice);
    }

    private String generateUniqueShareCode() {
        return UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }

    private OptionDto mapToOptionDto(Option opt) {
        return new OptionDto(
                opt.getId(),
                opt.getCategory(),
                opt.getSubCategory(),
                opt.getName(),
                opt.getPriceModifier(),
                opt.getAssetUrl(),
                opt.isAvailable()
        );
    }

    private ConfigResponse mapToSavedConfigResponse(SavedConfig config, BigDecimal basePrice) {
        String title = config.getCarTrim().getCarModel().getBrand() + " " +
                config.getCarTrim().getCarModel().getModelName() + " " +
                config.getCarTrim().getTrimName();

        List<OptionDto> optionDtos = config.getSelectedOptions().stream()
                .map(this::mapToOptionDto)
                .toList();

        return new ConfigResponse(
                config.getId(),
                config.getShareCode(),
                config.getCarTrim().getId(),
                title,
                basePrice,
                config.getTotalPrice(),
                optionDtos,
                config.getCreatedAt()
        );
    }
}
