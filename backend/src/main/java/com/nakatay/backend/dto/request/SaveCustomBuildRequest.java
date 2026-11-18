package com.nakatay.backend.dto.request;

import com.nakatay.backend.dto.CustomBuildConfiguration;

public record SaveCustomBuildRequest(
        String modelName,
        CustomBuildConfiguration configuration
) {}
