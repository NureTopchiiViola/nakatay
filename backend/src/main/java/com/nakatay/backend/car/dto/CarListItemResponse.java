package com.nakatay.backend.car.dto;

import java.math.BigDecimal;

public record CarListItemResponse(
        Long trimId,
        String title,
        Integer year,
        String engine,
        String transmission,
        BigDecimal price,
        String imageUrl
) {}