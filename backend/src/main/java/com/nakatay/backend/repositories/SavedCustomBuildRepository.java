package com.nakatay.backend.repositories;

import com.nakatay.backend.models.SavedCustomBuild;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedCustomBuildRepository extends JpaRepository<SavedCustomBuild, Long> {}
