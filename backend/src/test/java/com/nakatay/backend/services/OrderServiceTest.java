package com.nakatay.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nakatay.backend.dto.request.CreateOrderRequest;
import com.nakatay.backend.models.CustomerOrder;
import com.nakatay.backend.models.Role;
import com.nakatay.backend.models.User;
import com.nakatay.backend.repositories.CarTrimRepository;
import com.nakatay.backend.repositories.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderServiceTest {

    private OrderRepository orderRepository;
    private CarTrimRepository carTrimRepository;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        carTrimRepository = mock(CarTrimRepository.class);
        orderService = new OrderService(orderRepository, carTrimRepository, new ObjectMapper());
        when(orderRepository.save(any(CustomerOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
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
                "olena@example.com"
        );

        var response = orderService.createOrder(customer, request);

        assertEquals("BMW E46 328i Sport", response.vehicleName());
        assertEquals(List.of("Sport wheels"), response.selectedOptions());
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
                "olena@example.com"
        );

        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(
                User.builder().id(10L).role(Role.CLIENT).build(),
                request
        ));
    }
}
