package com.nakatay.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ConfigResponse(
        Long id,
        String shareCode,
        Long carTrimId,
        String title,
        BigDecimal basePrice,
        BigDecimal totalPrice,
        List<OptionDto> selectedOptions,
        boolean isPublic,
        LocalDateTime createdAt
) {}