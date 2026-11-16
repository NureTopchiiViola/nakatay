package com.nakatay.backend.dto.request;

import java.util.List;

public record ConfigRequest(
        Long carTrimId,
        List<Long> selectedOptionIds,
        Boolean isPublic
) {}