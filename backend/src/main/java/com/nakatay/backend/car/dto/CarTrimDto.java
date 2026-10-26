package com.nakatay.backend.car.dto;

import java.math.BigDecimal;
import java.util.List;

public record CarTrimDto(
        Long id,
        String brand,
        String modelName,
        String trimName,
        Integer year,
        String engine,
        String transmission,
        String bodyType,
        BigDecimal price,
        List<String> galleryUrls
) {}