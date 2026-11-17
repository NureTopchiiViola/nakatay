package com.nakatay.backend.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        OffsetDateTime createdAt,
        Long carId,
        String vehicleName,
        Integer year,
        String imageUrl,
        String color,
        List<String> selectedOptions,
        BigDecimal totalPrice,
        String status,
        String paymentMethod,
        String configurationData,
        Contact contact
) {
    public record Contact(String name, String phone, String email) {}
}
