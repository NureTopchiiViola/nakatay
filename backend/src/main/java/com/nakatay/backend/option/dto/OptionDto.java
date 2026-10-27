package com.nakatay.backend.option.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Доступна опція для вибору в конфігураторі")
public record OptionDto(
        @Schema(description = "ID опції", example = "10")
        Long id,

        @Schema(description = "Категорія опції (EXTERIOR, INTERIOR, PACKAGES, OPTIONS)", example = "INTERIOR")
        String category,

        @Schema(description = "Підкатегорія", example = "Матеріал та колір оздоблення салону")
        String subCategory,

        @Schema(description = "Назва опції", example = "Коньячна перфорована шкіра")
        String name,

        @Schema(description = "Доплата за опцію", example = "38000.00")
        BigDecimal priceModifier,

        @Schema(description = "URL асета/текстури/іконки", example = "https://example.com/assets/leather-brown.png")
        String assetUrl,

        @Schema(description = "Чи доступна опція для замовлення", example = "true")
        boolean isAvailable
) {}