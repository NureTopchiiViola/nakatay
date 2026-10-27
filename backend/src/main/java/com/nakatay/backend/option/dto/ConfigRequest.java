package com.nakatay.backend.option.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Запит на збереження конфігурації автомобіля")
public record ConfigRequest(
        @Schema(description = "ID комплектації", example = "1")
        Long carTrimId,

        @Schema(description = "Список обраних ID опцій", example = "[10, 12]")
        List<Long> selectedOptionIds,

        @Schema(description = "ID користувача (якщо авторизований)", example = "5")
        Long userId
) {}
