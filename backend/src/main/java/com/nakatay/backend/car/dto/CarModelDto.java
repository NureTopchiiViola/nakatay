package com.nakatay.backend.car.dto;

import java.math.BigDecimal;
import java.util.List;

public record CarModelDto(
        Long id,
        String brand,
        String modelName,
        BigDecimal basePrice,
        String description,
        String mainImageUrl,
        List<CarTrimDto> trims
) {}
