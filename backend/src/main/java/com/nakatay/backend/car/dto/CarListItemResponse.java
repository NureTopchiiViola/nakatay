package com.nakatay.backend.car.dto;

import java.math.BigDecimal;

public record CarListItemResponse(
        Long id,
        String brand,
        String modelName,
        BigDecimal basePrice,
        String mainImageUrl
) {}