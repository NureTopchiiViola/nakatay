package com.nakatay.backend.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nakatay.backend.common.exception.ResourceNotFoundException;
import com.nakatay.backend.dto.request.CreateOrderRequest;
import com.nakatay.backend.dto.response.OrderResponse;
import com.nakatay.backend.models.CarTrim;
import com.nakatay.backend.models.CustomerOrder;
import com.nakatay.backend.models.Role;
import com.nakatay.backend.models.User;
import com.nakatay.backend.repositories.CarTrimRepository;
import com.nakatay.backend.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Set<String> PAYMENT_METHODS = Set.of("cash", "leasing", "credit");

    private final OrderRepository orderRepository;
    private final CarTrimRepository carTrimRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public OrderResponse createOrder(User user, CreateOrderRequest request) {
        validateRequest(request);

        CarTrim carTrim = null;
        String vehicleName = request.vehicleName() == null ? "" : request.vehicleName().trim();
        Integer vehicleYear = request.year();
        String imageUrl = request.imageUrl();
        BigDecimal totalPrice = request.totalPrice();

        if (request.carId() != null) {
            carTrim = carTrimRepository.findByIdWithModel(request.carId())
                    .orElseThrow(() -> new ResourceNotFoundException("Комплектацію не знайдено"));
            if (carTrim.getCarModel().isDeleted() || !carTrim.isAvailable()) {
                throw new ResourceNotFoundException("Автомобіль недоступний");
            }

            vehicleName = carTrim.getCarModel().getBrand() + " "
                    + carTrim.getCarModel().getModelName() + " " + carTrim.getTrimName();
            vehicleYear = carTrim.getYear();
            imageUrl = carTrim.getGalleryUrls().stream().findFirst()
                    .orElse(carTrim.getCarModel().getMainImageUrl());
            totalPrice = carTrim.getCarModel().getBasePrice().add(carTrim.getPriceModifier());
        } else if (vehicleName.isBlank()) {
            throw new IllegalArgumentException("Назва автомобіля обов'язкова");
        }

        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
        order.setCarTrim(carTrim);
        order.setVehicleName(vehicleName);
        order.setVehicleYear(vehicleYear);
        order.setImageUrl(imageUrl);
        order.setColor(request.color() == null ? "" : request.color().trim());
        order.setSelectedOptions(writeSelectedOptions(request.selectedOptions()));
        order.setConfigurationData(request.configurationData());
        order.setTotalPrice(totalPrice);
        order.setStatus("NEW");
        order.setPaymentMethod(request.paymentMethod().trim().toLowerCase(Locale.ROOT));
        order.setContactName(request.contactName().trim());
        order.setContactPhone(request.contactPhone().trim());
        order.setContactEmail(request.contactEmail().trim());

        return toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(User user) {
        List<CustomerOrder> orders = user.getRole() == Role.ADMIN
                ? orderRepository.findAllByOrderByCreatedAtDescIdDesc()
                : orderRepository.findAllByUserIdOrderByCreatedAtDescIdDesc(user.getId());
        return orders.stream().map(this::toResponse).toList();
    }

    private void validateRequest(CreateOrderRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Дані заявки обов'язкові");
        }
        if (request.contactName() == null || request.contactName().isBlank()) {
            throw new IllegalArgumentException("Ім'я контактної особи обов'язкове");
        }
        if (request.contactPhone() == null || request.contactPhone().isBlank()) {
            throw new IllegalArgumentException("Номер телефону обов'язковий");
        }
        if (request.contactEmail() == null || request.contactEmail().isBlank()) {
            throw new IllegalArgumentException("Email обов'язковий");
        }
        if (!request.contactEmail().trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("Вкажіть коректну адресу email");
        }
        String normalizedPhone = request.contactPhone().trim().replaceAll("[\\s()-]", "");
        if (!normalizedPhone.matches("^(?:\\+?380\\d{9}|0\\d{9})$")) {
            throw new IllegalArgumentException("Вкажіть коректний український номер телефону");
        }
        if (request.paymentMethod() == null
                || !PAYMENT_METHODS.contains(request.paymentMethod().trim().toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Невідомий спосіб оплати");
        }
        if (request.selectedOptions() == null
                || request.selectedOptions().stream().anyMatch(option -> option == null || option.isBlank())) {
            throw new IllegalArgumentException("Список додаткових опцій має неправильний формат");
        }
        if (request.carId() == null && (request.totalPrice() == null
                || request.totalPrice().compareTo(BigDecimal.ZERO) < 0)) {
            throw new IllegalArgumentException("Вартість заявки має бути невід'ємним числом");
        }
    }

    private String writeSelectedOptions(List<String> selectedOptions) {
        try {
            return objectMapper.writeValueAsString(selectedOptions);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Не вдалося зберегти опції заявки", exception);
        }
    }

    private OrderResponse toResponse(CustomerOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getCreatedAt(),
                order.getCarTrim() == null ? null : order.getCarTrim().getId(),
                order.getVehicleName(),
                order.getVehicleYear(),
                order.getImageUrl(),
                order.getColor(),
                readSelectedOptions(order.getSelectedOptions()),
                order.getTotalPrice(),
                order.getStatus().toLowerCase(Locale.ROOT),
                order.getPaymentMethod(),
                order.getConfigurationData(),
                new OrderResponse.Contact(
                        order.getContactName(),
                        order.getContactPhone(),
                        order.getContactEmail()
                )
        );
    }

    private List<String> readSelectedOptions(String selectedOptions) {
        try {
            return objectMapper.readValue(selectedOptions, new TypeReference<>() {});
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Збережений список опцій заявки має неправильний формат", exception);
        }
    }
}
