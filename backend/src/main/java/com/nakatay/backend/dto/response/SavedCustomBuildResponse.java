package com.nakatay.backend.dto.response;

import com.nakatay.backend.dto.CustomBuildConfiguration;

import java.time.OffsetDateTime;

public record SavedCustomBuildResponse(
        Long id,
        String modelName,
        CustomBuildConfiguration configuration,
        OffsetDateTime createdAt
) {}
