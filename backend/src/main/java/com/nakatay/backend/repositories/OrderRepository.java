package com.nakatay.backend.repositories;

import com.nakatay.backend.models.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findAllByOrderByCreatedAtDescIdDesc();
    List<CustomerOrder> findAllByUserIdOrderByCreatedAtDescIdDesc(Long userId);
}
