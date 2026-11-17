package com.nakatay.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "saved_custom_build")
@Getter
@Setter
@NoArgsConstructor
public class SavedCustomBuild {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "model_name", nullable = false, length = 255)
    private String modelName;

    @Column(name = "configuration_data", nullable = false, columnDefinition = "TEXT")
    private String configurationData;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
