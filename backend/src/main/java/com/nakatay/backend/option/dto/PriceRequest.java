package com.nakatay.backend.option.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Запит для миттєвого підрахунку ціни обраних опцій")
public record PriceRequest(
        @Schema(description = "ID комплектації авто", example = "1")
        Long carTrimId,

        @Schema(description = "Список обраних ID опцій", example = "[10, 12]")
        List<Long> selectedOptionIds,

        @Schema(description = "Промокод (якщо введено)", example = "NAKATAY2026")
        String promoCode
) {}
