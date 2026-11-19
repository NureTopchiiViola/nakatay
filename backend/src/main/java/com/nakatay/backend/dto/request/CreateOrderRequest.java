package com.nakatay.backend.dto.request;

import java.math.BigDecimal;
import java.util.List;

public record CreateOrderRequest(
        Long carId,
        String vehicleName,
        Integer year,
        String imageUrl,
        String color,
        List<String> selectedOptions,
        BigDecimal totalPrice,
        String paymentMethod,
        String contactName,
        String contactPhone,
        String contactEmail,
        String configurationData,
        List<Long> selectedOptionIds
) {}
