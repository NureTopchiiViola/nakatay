package com.nakatay.backend.option;

import com.nakatay.backend.car.CarTrim;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "configuration_option")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Option {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_trim_id", nullable = false)
    private CarTrim carTrim;

    @Column(nullable = false)
    private String category;

    @Column(name = "sub_category")
    private String subCategory;

    @Column(nullable = false)
    private String name;

    @Column(name = "price_modifier", nullable = false)
    private BigDecimal priceModifier;

    @Column(name = "asset_url")
    private String assetUrl;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable = true;
}