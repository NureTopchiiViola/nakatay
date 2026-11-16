package com.nakatay.backend.repositories;

import com.nakatay.backend.models.SavedConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConfigRepository extends JpaRepository<SavedConfig, Long> {
    Optional<SavedConfig> findByShareCode(String shareCode);
    boolean existsByShareCode(String shareCode);
    List<SavedConfig> findAllByUserIdOrderByCreatedAtDesc(Long userId);
}