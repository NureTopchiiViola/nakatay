package com.nakatay.backend.repositories;

import com.nakatay.backend.models.SavedCustomBuild;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedCustomBuildRepository extends JpaRepository<SavedCustomBuild, Long> {
    List<SavedCustomBuild> findAllByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<SavedCustomBuild> findByIdAndUser_Id(Long id, Long userId);
}
