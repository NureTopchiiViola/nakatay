package com.nakatay.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "favorite_cars")
@Getter
@NoArgsConstructor
public class FavoriteCar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = false)
    private CarModel carModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_trim_id")
    private CarTrim carTrim;

    @Column(name = "added_at", nullable = false, updatable = false)
    private OffsetDateTime addedAt;

    public FavoriteCar(User user, CarModel carModel, CarTrim carTrim) {
        this.user = user;
        this.carModel = carModel;
        this.carTrim = carTrim;
    }

    @PrePersist
    protected void onCreate() {
        if (addedAt == null) {
            addedAt = OffsetDateTime.now();
        }
    }
}
