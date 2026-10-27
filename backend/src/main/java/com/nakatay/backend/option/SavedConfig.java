package com.nakatay.backend.option;

import com.nakatay.backend.car.CarTrim;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "saved_configuration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_trim_id", nullable = false)
    private CarTrim carTrim;

    @Column(name = "share_code", nullable = false, unique = true)
    private String shareCode;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @ManyToMany
    @JoinTable(
            name = "config_option_map",
            joinColumns = @JoinColumn(name = "config_id"),
            inverseJoinColumns = @JoinColumn(name = "option_id")
    )
    private Set<Option> selectedOptions = new HashSet<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}