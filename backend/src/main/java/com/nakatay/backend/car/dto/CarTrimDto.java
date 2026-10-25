package com.nakatay.backend.car.dto;

import java.math.BigDecimal;

public record CarTrimDto(
        String trimName,
        String engine,
        String transmission,
        Integer year,
        BigDecimal priceModifier
) {}