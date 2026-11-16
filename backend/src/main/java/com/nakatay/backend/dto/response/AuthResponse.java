package com.nakatay.backend.dto.response;

public record AuthResponse(
        String accessToken,
        UserProfileResponse user
) {}