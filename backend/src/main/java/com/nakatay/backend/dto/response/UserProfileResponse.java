package com.nakatay.backend.dto.response;

import com.nakatay.backend.models.Role;

public record UserProfileResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        Role role
) {}