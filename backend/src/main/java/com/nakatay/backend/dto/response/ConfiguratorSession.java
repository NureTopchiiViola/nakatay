package com.nakatay.backend.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ConfiguratorSession(
        Long trimId,
        String title,
        BigDecimal basePrice,
        String imageUrl,
        String visualizerKey,
        List<OptionDto> options
) {}
