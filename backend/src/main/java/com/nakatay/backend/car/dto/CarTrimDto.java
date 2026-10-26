package com.nakatay.backend.car.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Повна детальна інформація про комплектацію автомобіля")
public record CarTrimDto(
        @Schema(description = "Унікальний ідентифікатор комплектації", example = "1")
        Long id,

        @Schema(description = "Марка автомобіля", example = "BMW")
        String brand,

        @Schema(description = "Назва моделі", example = "M4")
        String modelName,

        @Schema(description = "Назва комплектації", example = "Competition")
        String trimName,

        @Schema(description = "Рік випуску", example = "2023")
        Integer year,

        @Schema(description = "Технічні характеристики двигуна", example = "3.0L Twin-Turbo I6")
        String engine,

        @Schema(description = "Тип коробки передач", example = "AUTOMATIC")
        String transmission,

        @Schema(description = "Тип кузова", example = "COUPE")
        String bodyType,

        @Schema(description = "Підсумкова вартість (базова ціна моделі + націнка)", example = "85000.00")
        BigDecimal price,

        @Schema(description = "Масив URL-посилань на зображення в галереї")
        List<String> galleryUrls
) {}