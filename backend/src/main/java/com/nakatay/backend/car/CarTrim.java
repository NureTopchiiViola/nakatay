package com.nakatay.backend.car;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "car_trim")
public class CarTrim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trim_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private CarModel carModel;

    @Column(name = "trim_name", nullable = false)
    private String trimName;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private String engine;

    @Column(nullable = false)
    private String transmission;

    @Column(name = "price_modifier")
    private BigDecimal priceModifier = BigDecimal.ZERO;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable = true;
}