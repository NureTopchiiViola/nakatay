package com.nakatay.backend.option.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Деталі збереженої конфігурації з посиланням для поширення")
public record ConfigResponse(
        @Schema(description = "ID збереженої конфігурації", example = "101")
        Long id,

        @Schema(description = "Унікальний код для посилання (shareCode)", example = "NK-74892")
        String shareCode,

        @Schema(description = "ID комплектації авто", example = "1")
        Long carTrimId,

        @Schema(description = "Назва моделі та комплектації", example = "NAKATAY Horizon GT-3D")
        String carTitle,

        @Schema(description = "Базова ціна авто", example = "1850000.00")
        BigDecimal basePrice,

        @Schema(description = "Підсумкова вартість", example = "1906000.00")
        BigDecimal totalPrice,

        @Schema(description = "Список обраних опцій")
        List<OptionDto> selectedOptions,

        @Schema(description = "Дата створення")
        LocalDateTime createdAt
) {}
