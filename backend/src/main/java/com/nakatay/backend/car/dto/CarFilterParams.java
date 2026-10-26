package com.nakatay.backend.car.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Параметри фільтрації та пошуку авто в каталозі")
public record CarFilterParams(
        @Schema(description = "Пошуковий запит (бренд, модель або назва комплектації)", example = "BMW M4")
        String query,

        @Schema(description = "Мінімальна підсумкова ціна", example = "30000.00")
        BigDecimal minPrice,

        @Schema(description = "Максимальна підсумкова ціна", example = "120000.00")
        BigDecimal maxPrice,

        @Schema(description = "Мінімальний рік випуску", example = "2020")
        Integer minYear,

        @Schema(description = "Максимальний рік випуску", example = "2024")
        Integer maxYear,

        @Schema(description = "Список типів кузова", example = "[\"COUPE\", \"SEDAN\"]")
        List<String> bodyTypes,

        @Schema(description = "Список типів коробок передач", example = "[\"AUTOMATIC\"]")
        List<String> transmissions,

        @Schema(description = "Список типів двигунів", example = "[\"3.0L Twin-Turbo I6\"]")
        List<String> engines
) {}