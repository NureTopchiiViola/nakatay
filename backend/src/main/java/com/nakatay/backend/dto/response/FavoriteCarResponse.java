package com.nakatay.backend.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record FavoriteCarResponse(
        Long trimId,
        String title,
        Integer year,
        String engine,
        String transmission,
        BigDecimal price,
        String imageUrl,
        OffsetDateTime addedAt
) {}
