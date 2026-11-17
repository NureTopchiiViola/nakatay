package com.nakatay.backend.dto.response;

import com.nakatay.backend.dto.CustomBuildConfiguration;

import java.time.OffsetDateTime;

public record SharedCustomBuildResponse(
        String shareCode,
        String url,
        String modelName,
        CustomBuildConfiguration configuration,
        OffsetDateTime createdAt
) {}
