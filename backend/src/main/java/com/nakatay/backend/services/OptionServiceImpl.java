package com.nakatay.backend.services;

import com.nakatay.backend.dto.request.ConfigRequest;
import com.nakatay.backend.dto.request.PriceRequest;
import com.nakatay.backend.dto.response.ConfigResponse;
import com.nakatay.backend.dto.response.OptionDto;
import com.nakatay.backend.dto.response.PriceResponse;
import com.nakatay.backend.models.CarTrim;
import com.nakatay.backend.models.Option;
import com.nakatay.backend.models.SavedConfig;
import com.nakatay.backend.models.User;
import com.nakatay.backend.repositories.CarTrimRepository;
import com.nakatay.backend.repositories.ConfigRepository;
import com.nakatay.backend.repositories.OptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OptionServiceImpl implements OptionService {
    private final OptionRepository optionRepository;
    private final ConfigRepository savedConfigRepository;
    private final CarTrimRepository carTrimRepository;

    @Override
    public List<OptionDto> getOptionsForTrim(Long trimId) {
        return optionRepository.findByCarTrimIdAndIsAvailableTrue(trimId).stream()
                .map(this::mapToOptionDto)
                .toList();
    }

    @Override
    public PriceResponse calculatePrice(PriceRequest request) {
        CarTrim trim = carTrimRepository.findById(request.carTrimId())
                .orElseThrow(() -> new IllegalArgumentException("Комплектацію не знайдено: " + request.carTrimId()));

        BigDecimal basePrice = calculateTrimBasePrice(trim);

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

    @Override
    @Transactional
    public ConfigResponse saveConfiguration(ConfigRequest request, User currentUser) {
        CarTrim trim = carTrimRepository.findById(request.carTrimId())
                .orElseThrow(() -> new IllegalArgumentException("Комплектацію не знайдено: " + request.carTrimId()));

        List<Option> options = request.selectedOptionIds() != null && !request.selectedOptionIds().isEmpty()
                ? optionRepository.findAllById(request.selectedOptionIds())
                : Collections.emptyList();

        BigDecimal basePrice = calculateTrimBasePrice(trim);
        BigDecimal optionsCost = options.stream()
                .map(Option::getPriceModifier)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        SavedConfig savedConfig = SavedConfig.builder()
                .user(currentUser)
                .carTrim(trim)
                .shareCode(generateUniqueShareCode())
                .totalPrice(basePrice.add(optionsCost))
                .selectedOptions(new HashSet<>(options))
                .isPublic(Boolean.TRUE.equals(request.isPublic()))
                .build();

        SavedConfig saved = savedConfigRepository.save(savedConfig);
        return mapToSavedConfigResponse(saved, basePrice);
    }

    @Override
    @Transactional(readOnly = true)
    public ConfigResponse getByShareCode(String shareCode, User currentUser) {
        SavedConfig config = savedConfigRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new IllegalArgumentException("Конфігурацію за кодом не знайдено: " + shareCode));

        boolean isOwner = currentUser != null
                && config.getUser() != null
                && config.getUser().getId().equals(currentUser.getId());

        if (!config.isPublic() && !isOwner) {
            throw new IllegalArgumentException("Ця конфігурація є приватною");
        }

        return mapToSavedConfigResponse(config, calculateTrimBasePrice(config.getCarTrim()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigResponse> getMyConfigurations(User currentUser) {
        return savedConfigRepository.findAllByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(config -> mapToSavedConfigResponse(config, calculateTrimBasePrice(config.getCarTrim())))
                .toList();
    }

    @Override
    @Transactional
    public ConfigResponse updateVisibility(Long configId, boolean isPublic, User currentUser) {
        SavedConfig config = getOwnedConfig(configId, currentUser);
        config.setPublic(isPublic);
        SavedConfig updated = savedConfigRepository.save(config);
        return mapToSavedConfigResponse(updated, calculateTrimBasePrice(updated.getCarTrim()));
    }

    @Override
    @Transactional
    public ConfigResponse cloneByShareCode(String shareCode, User currentUser) {
        SavedConfig source = savedConfigRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new IllegalArgumentException("Конфігурацію за кодом не знайдено: " + shareCode));

        boolean isOwner = source.getUser() != null && source.getUser().getId().equals(currentUser.getId());
        if (!source.isPublic() && !isOwner) {
            throw new IllegalArgumentException("Неможливо скопіювати приватну конфігурацію");
        }

        SavedConfig copy = SavedConfig.builder()
                .user(currentUser)
                .carTrim(source.getCarTrim())
                .shareCode(generateUniqueShareCode())
                .totalPrice(source.getTotalPrice())
                .selectedOptions(new HashSet<>(source.getSelectedOptions()))
                .isPublic(false)
                .build();

        SavedConfig savedCopy = savedConfigRepository.save(copy);
        return mapToSavedConfigResponse(savedCopy, calculateTrimBasePrice(savedCopy.getCarTrim()));
    }

    @Override
    @Transactional
    public void deleteConfiguration(Long configId, User currentUser) {
        SavedConfig config = getOwnedConfig(configId, currentUser);
        savedConfigRepository.delete(config);
    }

    private SavedConfig getOwnedConfig(Long configId, User currentUser) {
        SavedConfig config = savedConfigRepository.findById(configId)
                .orElseThrow(() -> new IllegalArgumentException("Конфігурацію не знайдено: " + configId));

        if (config.getUser() == null || !config.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("У вас немає доступу до цієї конфігурації");
        }
        return config;
    }

    private BigDecimal calculateTrimBasePrice(CarTrim trim) {
        return trim.getCarModel().getBasePrice()
                .add(trim.getPriceModifier() != null ? trim.getPriceModifier() : BigDecimal.ZERO);
    }

    private String generateUniqueShareCode() {
        String code;
        do {
            code = "NK-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        } while (savedConfigRepository.existsByShareCode(code));
        return code;
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
                config.isPublic(),
                config.getCreatedAt()
        );
    }
}