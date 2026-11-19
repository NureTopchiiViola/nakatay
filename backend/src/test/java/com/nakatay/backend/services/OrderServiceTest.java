package com.nakatay.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nakatay.backend.dto.request.CreateOrderRequest;
import com.nakatay.backend.models.CarModel;
import com.nakatay.backend.models.CarTrim;
import com.nakatay.backend.models.CustomerOrder;
import com.nakatay.backend.models.Option;
import com.nakatay.backend.models.Role;
import com.nakatay.backend.models.User;
import com.nakatay.backend.repositories.CarTrimRepository;
import com.nakatay.backend.repositories.OptionRepository;
import com.nakatay.backend.repositories.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderServiceTest {

    private OrderRepository orderRepository;
    private CarTrimRepository carTrimRepository;
    private OptionRepository optionRepository;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        carTrimRepository = mock(CarTrimRepository.class);
        optionRepository = mock(OptionRepository.class);
        orderService = new OrderService(orderRepository, carTrimRepository, new ObjectMapper(),
                new ConfigurationPricing(optionRepository));
        when(orderRepository.save(any(CustomerOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void configuredOrderUsesCatalogPriceAndPersistsTheSelectedOptions() {
        CarTrim trim = catalogTrim(5L);
        Option wheels = Option.builder().id(21L).carTrim(trim).name("Forged")
                .optionGroup("wheels").priceModifier(new BigDecimal("48000")).isAvailable(true).build();
        when(carTrimRepository.findByIdWithModel(5L)).thenReturn(Optional.of(trim));
        when(optionRepository.findAllById(List.of(21L))).thenReturn(List.of(wheels));

        var response = orderService.createOrder(User.builder().id(10L).role(Role.CLIENT).build(),
                configuredRequest(List.of(21L)));

        assertEquals(5L, response.carId());
        assertEquals(new BigDecimal("1898000"), response.totalPrice());
        assertEquals(List.of("Forged"), response.selectedOptions());
        assertEquals("configured=1&option=21", response.configurationData());
    }

    @Test
    void configuredOrderRejectsForeignOptionsAndMissingPackage() {
        CarTrim trim = catalogTrim(5L);
        Option foreign = Option.builder().id(21L).carTrim(catalogTrim(6L)).isAvailable(true).build();
        Option spoiler = Option.builder().id(22L).carTrim(trim).isAvailable(true)
                .optionGroup("extra").requiredVisualCode("sport").build();
        when(carTrimRepository.findByIdWithModel(5L)).thenReturn(Optional.of(trim));
        when(optionRepository.findAllById(List.of(21L))).thenReturn(List.of(foreign));
        when(optionRepository.findAllById(List.of(22L))).thenReturn(List.of(spoiler));
        User customer = User.builder().id(10L).role(Role.CLIENT).build();

        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(customer, configuredRequest(List.of(21L))));
        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(customer, configuredRequest(List.of(22L))));
    }

    private CarTrim catalogTrim(long id) {
        CarModel model = new CarModel();
        model.setBrand("BMW");
        model.setModelName("E46 328i");
        model.setBasePrice(new BigDecimal("1850000"));
        CarTrim trim = new CarTrim();
        trim.setId(id);
        trim.setCarModel(model);
        trim.setTrimName("Sport");
        trim.setYear(1999);
        trim.setGalleryUrls(List.of());
        return trim;
    }

    private CreateOrderRequest configuredRequest(List<Long> optionIds) {
        return new CreateOrderRequest(5L, null, null, null, "", List.of("Untrusted"), BigDecimal.ONE,
                "cash", "Олена Коваль", "+380671234567", "olena@example.com", null, optionIds);
    }

    @Test
    void createOrderStoresCustomerAndOrderDetails() {
        User customer = User.builder().id(10L).role(Role.CLIENT).build();
        CreateOrderRequest request = new CreateOrderRequest(
                null,
                "BMW E46 328i Sport",
                1999,
                "",
                "Crimson",
                List.of("Sport wheels"),
                new BigDecimal("1850000"),
                "cash",
                "Олена Коваль",
                "+380671234567",
                "olena@example.com",
                "paint=crimson",
                null
        );

        var response = orderService.createOrder(customer, request);

        assertEquals("BMW E46 328i Sport", response.vehicleName());
        assertEquals(List.of("Sport wheels"), response.selectedOptions());
        assertEquals("paint=crimson", response.configurationData());
        assertEquals("new", response.status());
        assertEquals("Олена Коваль", response.contact().name());
        verify(orderRepository).save(any(CustomerOrder.class));
    }

    @Test
    void getOrdersLoadsOnlyTheAuthenticatedCustomersOrders() {
        User customer = User.builder().id(10L).role(Role.CLIENT).build();
        when(orderRepository.findAllByUserIdOrderByCreatedAtDescIdDesc(10L)).thenReturn(List.of());

        orderService.getOrders(customer);

        verify(orderRepository).findAllByUserIdOrderByCreatedAtDescIdDesc(10L);
    }

    @Test
    void getOrdersLoadsAllOrdersForAdministrators() {
        User administrator = User.builder().id(2L).role(Role.ADMIN).build();
        when(orderRepository.findAllByOrderByCreatedAtDescIdDesc()).thenReturn(List.of());

        orderService.getOrders(administrator);

        verify(orderRepository).findAllByOrderByCreatedAtDescIdDesc();
    }

    @Test
    void createOrderRejectsNegativeCustomOrderPrice() {
        CreateOrderRequest request = new CreateOrderRequest(
                null,
                "BMW E46 328i Sport",
                1999,
                "",
                "",
                List.of(),
                new BigDecimal("-1"),
                "cash",
                "Олена Коваль",
                "+380671234567",
                "olena@example.com",
                "paint=crimson",
                null
        );

        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(
                User.builder().id(10L).role(Role.CLIENT).build(),
                request
        ));
    }
}
