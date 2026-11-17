package com.nakatay.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record CustomBuildConfiguration(
        String paint,
        String wheels,
        String interior,
        String decor,
        @JsonProperty("package") String packageName,
        List<String> extras
) {}
