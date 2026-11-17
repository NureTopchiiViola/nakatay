package com.nakatay.backend.repositories;

import com.nakatay.backend.models.SharedCustomBuild;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SharedCustomBuildRepository extends JpaRepository<SharedCustomBuild, Long> {
    Optional<SharedCustomBuild> findByShareCode(String shareCode);

    boolean existsByShareCode(String shareCode);
}
