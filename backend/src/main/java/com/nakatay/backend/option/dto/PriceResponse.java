package com.nakatay.backend.option.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Результат калькуляції вартості конфігурації")
public record PriceResponse(
        @Schema(description = "Базова ціна моделі", example = "1850000.00")
        BigDecimal basePrice,

        @Schema(description = "Сума обраних опцій", example = "56000.00")
        BigDecimal optionsCost,

        @Schema(description = "Сума знижки за промокодом", example = "0.00")
        BigDecimal discountAmount,

        @Schema(description = "Підсумкова загальна вартість", example = "1906000.00")
        BigDecimal totalPrice
) {}