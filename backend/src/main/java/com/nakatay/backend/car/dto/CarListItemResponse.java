package com.nakatay.backend.car.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Коротка інформація про комплектацію для картки в каталозі")
public record CarListItemResponse(
        @Schema(description = "Унікальний ідентифікатор комплектації (trim_id)", example = "1")
        Long trimId,

        @Schema(description = "Повна назва авто (Бренд + Модель + Комплектація)", example = "BMW M4 Competition")
        String title,

        @Schema(description = "Рік випуску", example = "2023")
        Integer year,

        @Schema(description = "Технічні характеристики двигуна", example = "3.0L Twin-Turbo I6")
        String engine,

        @Schema(description = "Тип коробки передач", example = "AUTOMATIC")
        String transmission,

        @Schema(description = "Підсумкова вартість (базова ціна моделі + націнка)", example = "85000.00")
        BigDecimal price,

        @Schema(description = "URL-посилання на головне зображення", example = "https://example.com/images/bmw-m4.jpg")
        String imageUrl
) {}